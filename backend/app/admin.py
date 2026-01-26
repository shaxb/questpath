from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_
from typing import Annotated
from datetime import datetime, timedelta, timezone

from app.db import get_db
from app.models import User, Goal, Event
from app.auth import get_current_user, get_admin_user
from app.logger import logger


router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/stats")
async def get_admin_stats(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_admin_user)]
):
    """
    Get comprehensive admin statistics and user activity.
    Only accessible by admin users.
    """
    
    now = datetime.now(timezone.utc)
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    week_start = now - timedelta(days=7)
    month_start = now - timedelta(days=30)
    
    # Users stats
    total_users_result = await db.execute(select(func.count(User.id)))
    total_users = total_users_result.scalar()
    
    users_today_result = await db.execute(
        select(func.count(User.id)).where(User.created_at >= today_start)
    )
    users_today = users_today_result.scalar()
    
    users_week_result = await db.execute(
        select(func.count(User.id)).where(User.created_at >= week_start)
    )
    users_week = users_week_result.scalar()
    
    premium_users_result = await db.execute(
        select(func.count(User.id)).where(
            and_(
                User.is_premium == True,
                or_(
                    User.premium_expiry.is_(None),
                    User.premium_expiry > now
                )
            )
        )
    )
    premium_users = premium_users_result.scalar()
    
    # Goals stats
    total_goals_result = await db.execute(select(func.count(Goal.id)))
    total_goals = total_goals_result.scalar()
    
    goals_today_result = await db.execute(
        select(func.count(Goal.id)).where(Goal.created_at >= today_start)
    )
    goals_today = goals_today_result.scalar()
    
    goals_week_result = await db.execute(
        select(func.count(Goal.id)).where(Goal.created_at >= week_start)
    )
    goals_week = goals_week_result.scalar()
    
    # Recent events (today)
    events_today_result = await db.execute(
        select(Event)
        .where(Event.created_at >= today_start)
        .order_by(Event.created_at.desc())
        .limit(100)
    )
    events_today = events_today_result.scalars().all()
    
    # Event counts by type (today)
    event_counts_result = await db.execute(
        select(Event.event_type, func.count(Event.id))
        .where(Event.created_at >= today_start)
        .group_by(Event.event_type)
    )
    event_counts = {row[0]: row[1] for row in event_counts_result.all()}
    
    # Top active users (this week by total_exp)
    top_users_result = await db.execute(
        select(User.id, User.email, User.display_name, User.total_exp, User.is_premium)
        .order_by(User.total_exp.desc())
        .limit(10)
    )
    top_users = [
        {
            "id": row[0],
            "email": row[1],
            "display_name": row[2],
            "total_exp": row[3],
            "is_premium": row[4]
        }
        for row in top_users_result.all()
    ]
    
    # Recent signups
    recent_signups_result = await db.execute(
        select(User.id, User.email, User.display_name, User.created_at, User.is_premium)
        .order_by(User.created_at.desc())
        .limit(10)
    )
    recent_signups = [
        {
            "id": row[0],
            "email": row[1],
            "display_name": row[2],
            "created_at": row[3].isoformat(),
            "is_premium": row[4]
        }
        for row in recent_signups_result.all()
    ]
    
    # Format events for response
    formatted_events = []
    for event in events_today:
        formatted_events.append({
            "id": event.id,
            "type": event.event_type,
            "user_id": event.user_id,
            "data": event.data,
            "created_at": event.created_at.isoformat()
        })
    
    return {
        "timestamp": now.isoformat(),
        "users": {
            "total": total_users,
            "today": users_today,
            "this_week": users_week,
            "premium_active": premium_users
        },
        "goals": {
            "total": total_goals,
            "today": goals_today,
            "this_week": goals_week
        },
        "events_today": {
            "total": len(formatted_events),
            "by_type": event_counts,
            "recent": formatted_events[:20]  # Last 20 events
        },
        "top_users": top_users,
        "recent_signups": recent_signups
    }


@router.get("/events")
async def get_events(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_admin_user)],
    event_type: str | None = None,
    user_id: int | None = None,
    hours: int = 24,
    limit: int = 100
):
    """
    Get filtered list of events.
    Only accessible by admin users.
    
    Query params:
    - event_type: Filter by event type
    - user_id: Filter by user ID
    - hours: Look back this many hours (default 24)
    - limit: Max events to return (default 100)
    """
    
    cutoff_time = datetime.now(timezone.utc) - timedelta(hours=hours)
    
    query = select(Event).where(Event.created_at >= cutoff_time)
    
    if event_type:
        query = query.where(Event.event_type == event_type)
    
    if user_id:
        query = query.where(Event.user_id == user_id)
    
    query = query.order_by(Event.created_at.desc()).limit(limit)
    
    result = await db.execute(query)
    events = result.scalars().all()
    
    return {
        "filters": {
            "event_type": event_type,
            "user_id": user_id,
            "hours": hours
        },
        "count": len(events),
        "events": [
            {
                "id": event.id,
                "type": event.event_type,
                "user_id": event.user_id,
                "data": event.data,
                "created_at": event.created_at.isoformat()
            }
            for event in events
        ]
    }
