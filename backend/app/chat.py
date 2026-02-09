from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from typing import Dict, List
import json
from datetime import datetime, timezone

from app.db import get_db
from app.models import ChatMessage, User
from app.schemas import ChatMessageResponse
from app.auth import decode_token, get_current_user
from app.logger import logger
from app.cache import redis_client

router = APIRouter()


class ConnectionManager:
    """Manages active WebSocket connections for global chat"""
    
    def __init__(self):
        # Map of user_id -> WebSocket connection
        self.active_connections: Dict[int, WebSocket] = {}
    
    async def connect(self, user_id: int, websocket: WebSocket):
        """Accept and store a new WebSocket connection"""
        await websocket.accept()
        self.active_connections[user_id] = websocket
        logger.info(f"User {user_id} connected to chat. Total connections: {len(self.active_connections)}")
    
    def disconnect(self, user_id: int):
        """Remove a WebSocket connection"""
        if user_id in self.active_connections:
            del self.active_connections[user_id]
            logger.info(f"User {user_id} disconnected from chat. Total connections: {len(self.active_connections)}")
    
    async def broadcast(self, message: dict):
        """Send message to all connected clients"""
        disconnected_users = []
        
        for user_id, connection in self.active_connections.items():
            try:
                await connection.send_json(message)
            except Exception as e:
                logger.warning(f"Failed to send message to user {user_id}: {e}")
                disconnected_users.append(user_id)
        
        # Clean up disconnected clients
        for user_id in disconnected_users:
            self.disconnect(user_id)
    
    async def send_personal(self, user_id: int, message: dict):
        """Send message to a specific user"""
        if user_id in self.active_connections:
            try:
                await self.active_connections[user_id].send_json(message)
            except Exception as e:
                logger.warning(f"Failed to send personal message to user {user_id}: {e}")
                self.disconnect(user_id)
    
    def get_online_count(self) -> int:
        """Get count of active connections"""
        return len(self.active_connections)


# Global connection manager instance
manager = ConnectionManager()


async def check_rate_limit(user_id: int) -> bool:
    """
    Check if user has exceeded rate limit (5 messages per minute).
    Returns True if within limit, False if exceeded.
    """
    try:
        key = f"chat_rate:{user_id}"
        current_count = redis_client.get(key)
        
        if current_count is None:
            # First message in window
            redis_client.setex(key, 60, 1)
            return True
        
        count = int(current_count)
        if count >= 5:
            return False
        
        # Increment counter
        redis_client.incr(key)
        return True
        
    except Exception as e:
        logger.error(f"Redis error in rate limiting: {e}")
        # Allow message if Redis fails
        return True


@router.websocket("/ws/chat")
async def websocket_chat_endpoint(
    websocket: WebSocket,
    token: str = Query(...),
    db: AsyncSession = Depends(get_db)
):
    """
    WebSocket endpoint for global chat.
    Authenticates via JWT token in query parameter.
    """
    user_id = None
    
    try:
        # Authenticate user from token
        try:
            payload = decode_token(token)
            user_id = int(payload.get("sub"))
        except Exception as e:
            await websocket.close(code=1008, reason="Invalid or expired token")
            logger.warning(f"WebSocket auth failed: {e}")
            return
        
        # Get user from database
        result = await db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        
        if not user:
            await websocket.close(code=1008, reason="User not found")
            return
        
        # Connect user
        await manager.connect(user_id, websocket)
        
        # Send last 50 messages as history
        history_result = await db.execute(
            select(ChatMessage, User)
            .join(User, ChatMessage.user_id == User.id)
            .where(ChatMessage.is_deleted == False)
            .order_by(desc(ChatMessage.created_at))
            .limit(50)
        )
        history_rows = history_result.all()
        
        # Reverse to show oldest first
        history_messages = []
        for chat_msg, msg_user in reversed(history_rows):
            history_messages.append({
                "type": "message",
                "id": chat_msg.id,
                "user_id": msg_user.id,
                "user_display_name": msg_user.display_name or msg_user.email.split("@")[0],
                "user_is_premium": msg_user.is_premium,
                "message": chat_msg.message,
                "created_at": chat_msg.created_at.isoformat()
            })
        
        # Send history
        await websocket.send_json({
            "type": "history",
            "messages": history_messages,
            "online_count": manager.get_online_count()
        })
        
        # Broadcast user joined
        await manager.broadcast({
            "type": "system",
            "message": f"{user.display_name or user.email.split('@')[0]} joined the chat",
            "online_count": manager.get_online_count()
        })
        
        # Listen for messages
        while True:
            data = await websocket.receive_text()
            
            try:
                message_data = json.loads(data)
                message_type = message_data.get("type")
                
                if message_type == "message":
                    content = message_data.get("content", "").strip()
                    
                    # Validate message
                    if not content:
                        await manager.send_personal(user_id, {
                            "type": "error",
                            "message": "Message cannot be empty"
                        })
                        continue
                    
                    if len(content) > 500:
                        await manager.send_personal(user_id, {
                            "type": "error",
                            "message": "Message too long (max 500 characters)"
                        })
                        continue
                    
                    # Check rate limit
                    if not await check_rate_limit(user_id):
                        await manager.send_personal(user_id, {
                            "type": "error",
                            "message": "Too many messages. Please wait before sending more."
                        })
                        continue
                    
                    # Save to database
                    chat_message = ChatMessage(
                        user_id=user_id,
                        message=content
                    )
                    db.add(chat_message)
                    await db.commit()
                    await db.refresh(chat_message)
                    
                    # Broadcast to all users
                    await manager.broadcast({
                        "type": "message",
                        "id": chat_message.id,
                        "user_id": user.id,
                        "user_display_name": user.display_name or user.email.split("@")[0],
                        "user_is_premium": user.is_premium,
                        "message": chat_message.message,
                        "created_at": chat_message.created_at.isoformat()
                    })
                    
                elif message_type == "ping":
                    # Respond to ping for connection health check
                    await manager.send_personal(user_id, {
                        "type": "pong",
                        "online_count": manager.get_online_count()
                    })
                    
            except json.JSONDecodeError:
                await manager.send_personal(user_id, {
                    "type": "error",
                    "message": "Invalid message format"
                })
            except Exception as e:
                logger.error(f"Error processing message from user {user_id}: {e}")
                await manager.send_personal(user_id, {
                    "type": "error",
                    "message": "Failed to process message"
                })
    
    except WebSocketDisconnect:
        logger.info(f"User {user_id} WebSocket disconnected")
    except Exception as e:
        logger.error(f"WebSocket error for user {user_id}: {e}")
    finally:
        if user_id:
            manager.disconnect(user_id)
            # Broadcast user left
            await manager.broadcast({
                "type": "system",
                "message": f"{user.display_name or user.email.split('@')[0]} left the chat",
                "online_count": manager.get_online_count()
            })


@router.get("/chat/messages", response_model=List[ChatMessageResponse])
async def get_chat_messages(
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get chat message history.
    Protected endpoint - must be authenticated.
    """
    result = await db.execute(
        select(ChatMessage, User)
        .join(User, ChatMessage.user_id == User.id)
        .where(ChatMessage.is_deleted == False)
        .order_by(desc(ChatMessage.created_at))
        .limit(limit)
        .offset(offset)
    )
    rows = result.all()
    
    # Convert to response format
    messages = []
    for chat_msg, msg_user in reversed(rows):
        messages.append(ChatMessageResponse(
            id=chat_msg.id,
            user_id=msg_user.id,
            user_display_name=msg_user.display_name or msg_user.email.split("@")[0],
            user_is_premium=msg_user.is_premium,
            message=chat_msg.message,
            created_at=chat_msg.created_at
        ))
    
    return messages
