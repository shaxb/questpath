from sqlalchemy.ext.asyncio import AsyncSession
from app.models import Event
from app.logger import logger


async def log_event(
    db: AsyncSession,
    event_type: str,
    user_id: int | None = None,
    data: dict | None = None
):
    """
    Log an event to the events table.
    
    Args:
        db: Database session
        event_type: Type of event (e.g., 'user_registered', 'goal_created', 'premium_purchased')
        user_id: Optional user ID associated with event
        data: Optional additional data as JSON
    """
    try:
        event = Event(
            event_type=event_type,
            user_id=user_id,
            data=data or {}
        )
        db.add(event)
        await db.commit()
        
        logger.info(
            "Event logged",
            event_type=event_type,
            user_id=user_id,
            event="event_logged"
        )
    except Exception as e:
        logger.error(
            "Failed to log event",
            event_type=event_type,
            user_id=user_id,
            error=str(e),
            event="event_log_error"
        )
        await db.rollback()
