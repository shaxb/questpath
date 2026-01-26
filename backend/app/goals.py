from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.orm.attributes import flag_modified
from typing import Annotated, List
from datetime import datetime, timezone

from .db import get_db
from .models import User, Goal, Roadmap, Level, GoalStatus, DifficultyLevel, LevelStatus
from .schemas import CreateGoalRequest, GoalResponse, GoalListItem
from .auth import get_current_user
from .ai_service import generate_roadmap
from .rate_limiter import check_rate_limit
from .logger import logger
from .metrics import metrics
from .events import log_event

router = APIRouter(prefix="/goals", tags=["goals"])


def is_user_premium(user: User) -> bool:
    """
    Check if user has active premium subscription.
    Returns True if user is premium and subscription hasn't expired.
    """
    if not user.is_premium:
        return False
    
    # If is_premium is True but no expiry date is set, treat as active premium
    if user.premium_expiry is None:
        return True
    
    # Check if premium has expired
    now = datetime.now(timezone.utc)
    # Ensure premium_expiry is timezone-aware
    expiry = user.premium_expiry
    if expiry.tzinfo is None:
        expiry = expiry.replace(tzinfo=timezone.utc)
    
    return expiry > now


# Endpoint to create a new goal with AI-generated roadmap
@router.post("", response_model=GoalResponse, status_code=201)
async def create_goal(
    request: Request,
    incoming_request: CreateGoalRequest,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)]
):
    """
    Create a new goal with AI-generated roadmap.
    
    1. User sends goal description
    2. AI generates structured roadmap
    3. Store Goal + Roadmap + Levels in database
    4. Return complete goal with roadmap
    """
    # Rate limiting: 15 goals per hour (AI generation is expensive)
    await check_rate_limit(request, "create_goal", limit=15, window=360)

    # Check premium status and goal limits
    # Free users: 2 goals maximum
    # Premium users: unlimited goals
    
    result = await db.execute(
        select(Goal).where(Goal.user_id == current_user.id)
    )
    user_goals_count = len(result.scalars().all())
    
    # Check if user has active premium
    has_premium = is_user_premium(current_user)
    
    # Handle premium expiration
    if current_user.is_premium and not has_premium:
        # Premium has expired
        logger.warning(
            "User's premium subscription has expired",
            user_id=current_user.id,
            expiry=current_user.premium_expiry,
            event="premium_expired"
        )
        
        # Update user's is_premium to False
        current_user.is_premium = False
        db.add(current_user)
        await db.commit()
        await db.refresh(current_user)
        
        # Check if they exceed free tier limit
        if user_goals_count >= 2:
            raise HTTPException(
                status_code=403,
                detail={
                    "message": "Your premium subscription has expired. You've reached the limit of 2 goals for free users.",
                    "code": "PREMIUM_EXPIRED",
                    "redirect": "/pricing",
                    "current_goals": user_goals_count,
                    "max_goals": 2
                }
            )
    
    # Check free tier limit
    if user_goals_count >= 2 and not has_premium:
        logger.info(
            "User reached free tier goal limit",
            user_id=current_user.id,
            current_goals=user_goals_count,
            event="goal_limit_reached"
        )
        raise HTTPException(
            status_code=403,
            detail={
                "message": "You've reached the limit of 2 goals for free users. Upgrade to Premium for unlimited goals!",
                "code": "GOAL_LIMIT_REACHED",
                "redirect": "/pricing",
                "current_goals": user_goals_count,
                "max_goals": 2
            }
        )
    
    try:
        # Step 1: Generate roadmap using AI
        ai_data = await generate_roadmap(incoming_request.description)
        
        # Step 2: Create Goal
        goal = Goal(
            user_id=current_user.id,
            title=ai_data["title"],
            description=incoming_request.description,
            category=ai_data["category"],
            difficulty_level=DifficultyLevel(ai_data["difficulty"]),
            status=GoalStatus.NOT_STARTED
        )
        db.add(goal)
        await db.flush()  # Get goal.id
        
        # Step 3: Create Roadmap
        roadmap = Roadmap(
            goal_id=goal.id,
            name=ai_data["roadmap"]["name"]
        )
        db.add(roadmap)
        await db.flush()  # Get roadmap.id
        
        # Step 4: Create Levels
        for level_data in ai_data["roadmap"]["levels"]:
            level = Level(
                roadmap_id=roadmap.id,
                order=level_data["order"],
                title=level_data["title"],
                description=level_data["description"],
                topics=level_data["topics"],
                xp_reward=level_data["xp_reward"],
                status=LevelStatus.UNLOCKED if level_data["order"] == 1 else LevelStatus.LOCKED
            )
            db.add(level)
        
        await db.commit()
        
        # Step 5: Refresh and load relationships
        await db.refresh(goal)
        result = await db.execute(
            select(Goal)
            .options(selectinload(Goal.roadmap).selectinload(Roadmap.levels))
            .where(Goal.id == goal.id)
        )
        goal = result.scalar_one()
        
        # Track business metric
        metrics.increment_business_metric("goals_created")

        # Log event
        await log_event(db, "goal_created", user_id=current_user.id, data={"goal_id": goal.id, "title": goal.title, "is_premium": has_premium})
        
        logger.info(
            "Goal created successfully",
            user_id=current_user.id,
            goal_id=goal.id,
            is_premium=has_premium,
            event="goal_created"
        )
        
        return goal
        
    except HTTPException:
        # Re-raise HTTP exceptions (like premium/limit errors)
        raise
    except ValueError as e:
        # AI validation errors (invalid data structure from AI)
        logger.error("Invalid goal data from AI", error=str(e), user_id=current_user.id, event="invalid_goal_data")
        await db.rollback()
        raise HTTPException(
            status_code=400,
            detail={
                "message": "Failed to generate a valid roadmap. Please try rephrasing your goal description.",
                "code": "INVALID_AI_RESPONSE",
                "error": str(e)
            }
        )
    except Exception as e:
        # Other errors (OpenAI API, database, network issues, etc.)
        logger.error("Failed to create goal", error=str(e), user_id=current_user.id, event="goal_creation_error")
        await db.rollback()
        
        # Check if it's an AI service error
        error_message = str(e).lower()
        if "openai" in error_message or "api" in error_message or "rate limit" in error_message:
            raise HTTPException(
                status_code=503,
                detail={
                    "message": "AI service is temporarily unavailable. Please try again in a moment.",
                    "code": "AI_SERVICE_ERROR",
                    "error": str(e)
                }
            )
        
        # Generic error
        raise HTTPException(
            status_code=500,
            detail={
                "message": "An unexpected error occurred while creating your goal. Please try again.",
                "code": "INTERNAL_ERROR",
                "error": str(e)
            }
        )



# Endpoint to get all goals for the current user (without roadmap details)
@router.get("/me", response_model=List[GoalListItem])
async def get_my_goals(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)]
):
    """
    Get all goals for the current user (without roadmap details for performance).
    """
    result = await db.execute(
        select(Goal)
        .where(Goal.user_id == current_user.id)
        .order_by(Goal.created_at.desc())
    )
    goals = result.scalars().all()
    return goals

# Endpoint to get a specific goal with full roadmap and levels
@router.get("/{goal_id}", response_model=GoalResponse)
async def get_goal(
    goal_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)]
):
    """
    Get a specific goal with full roadmap and levels.
    """
    result = await db.execute(
        select(Goal)
        .options(selectinload(Goal.roadmap).selectinload(Roadmap.levels))
        .where(Goal.id == goal_id, Goal.user_id == current_user.id)
    )
    goal = result.scalar_one_or_none()

    if not goal:
        logger.error("Goal not found", goal_id=goal_id, user_id=current_user.id, event="goal_not_found")
        raise HTTPException(status_code=404, detail="Goal not found")
    
    return goal


# Additional endpoints for updating goal status
@router.patch("/levels/{level_id}/topics/{topic_index}")
async def mark_topic(
    level_id: int,
    topic_index: int,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)]
):
    """
    Mark a specific topic within a level as completed.
    """
    # Fetch the level and associated goal to verify ownership
    result = await db.execute(
        select(Level)
        .join(Roadmap, Level.roadmap_id == Roadmap.id)
        .join(Goal, Roadmap.goal_id == Goal.id)
        .where(Level.id == level_id, Goal.user_id == current_user.id)
    )
    level = result.scalar_one_or_none()
    
    if not level:
        logger.error("Level not found for marking topic", level_id=level_id, user_id=current_user.id, event="level_not_found")
        raise HTTPException(status_code=404, detail="Level not found")
    
    # Update the topic's completed status
    if level.topics is None or topic_index < 0 or topic_index >= len(level.topics):
        logger.error("Invalid topic index for marking topic", level_id=level_id, topic_index=topic_index, event="invalid_topic_index")
        raise HTTPException(status_code=400, detail="Invalid topic index")
    
    level.topics[topic_index]["completed"] = not level.topics[topic_index]["completed"]
    flag_modified(level, "topics")  # Tell SQLAlchemy that topics changed
    
    # Log event if topic was just marked complete (not uncomplete)
    if level.topics[topic_index]["completed"]:
        await log_event(db, "topic_completed", user_id=current_user.id, data={
            "level_id": level.id,
            "level_title": level.title,
            "topic_index": topic_index,
            "topic_title": level.topics[topic_index].get("title", "")
        })
    
    await db.commit()
    return {"detail": "Topic marked as completed"}
