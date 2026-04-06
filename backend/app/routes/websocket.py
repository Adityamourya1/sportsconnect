from fastapi import APIRouter, WebSocket, WebSocketDisconnect, status
from fastapi.exceptions import HTTPException
import logging
from typing import Set, Dict
import json
from bson import ObjectId

logger = logging.getLogger(__name__)

# Store active WebSocket connections
# Format: {"user_id": WebSocket}
active_connections: Dict[str, WebSocket] = {}

router = APIRouter(prefix="/api/ws", tags=["websocket"])

@router.websocket("/notifications/{user_id}")
async def websocket_notifications(websocket: WebSocket, user_id: str):
    """
    WebSocket endpoint for real-time notifications.
    
    Methods:
    - subscribe: Subscribe to notifications
    - send_notification: Send a notification (admin only)
    """
    await websocket.accept()
    active_connections[user_id] = websocket
    logger.info(f"✓ User {user_id} connected to notifications")
    
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            
            # Handle different message types
            if message.get("type") == "ping":
                # Keep connection alive
                await websocket.send_text(json.dumps({"type": "pong"}))
            
            elif message.get("type") == "get_notifications":
                # Client requesting their notifications
                # This would fetch from DB in production
                pass
    
    except WebSocketDisconnect:
        if user_id in active_connections:
            del active_connections[user_id]
        logger.info(f"✓ User {user_id} disconnected from notifications")
    except Exception as e:
        logger.error(f"WebSocket error for user {user_id}: {e}")
        if user_id in active_connections:
            del active_connections[user_id]

@router.websocket("/messaging/{user_id}")
async def websocket_messaging(websocket: WebSocket, user_id: str):
    """
    WebSocket endpoint for real-time messaging.
    
    Messages format:
    {
        "type": "message",
        "recipient_id": "...",
        "text": "...",
        "timestamp": "..."
    }
    """
    await websocket.accept()
    active_connections[user_id] = websocket
    logger.info(f"✓ User {user_id} connected to messaging")
    
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            
            if message.get("type") == "message":
                recipient_id = message.get("recipient_id")
                
                # Send to recipient if they're online
                if recipient_id in active_connections:
                    await active_connections[recipient_id].send_text(
                        json.dumps({
                            "type": "message",
                            "sender_id": user_id,
                            "text": message.get("text"),
                            "timestamp": message.get("timestamp")
                        })
                    )
                    logger.info(f"✓ Message delivered from {user_id} to {recipient_id}")
                else:
                    # Recipient offline - store in DB for later
                    logger.info(f"⚠ Recipient {recipient_id} offline, storing message")
    
    except WebSocketDisconnect:
        if user_id in active_connections:
            del active_connections[user_id]
        logger.info(f"✓ User {user_id} disconnected from messaging")
    except Exception as e:
        logger.error(f"WebSocket error for user {user_id}: {e}")
        if user_id in active_connections:
            del active_connections[user_id]


# Helper functions for broadcasting notifications

async def broadcast_notification(notification_type: str, target_user_id: str, data: dict):
    """Broadcast a notification to a specific user"""
    if target_user_id in active_connections:
        try:
            await active_connections[target_user_id].send_text(
                json.dumps({
                    "type": notification_type,
                    **data
                })
            )
            logger.info(f"✓ Notification sent to {target_user_id}")
        except Exception as e:
            logger.error(f"Failed to send notification: {e}")

async def notify_like(post_id: str, user_id: str, liker_username: str):
    """Notify user when post is liked"""
    await broadcast_notification(
        "post_liked",
        user_id,
        {
            "post_id": post_id,
            "liker_id": user_id,
            "liker_username": liker_username,
            "message": f"{liker_username} liked your post"
        }
    )

async def notify_follow(follower_id: str, follower_username: str, target_user_id: str):
    """Notify user when they're followed"""
    await broadcast_notification(
        "user_followed",
        target_user_id,
        {
            "follower_id": follower_id,
            "follower_username": follower_username,
            "message": f"{follower_username} started following you"
        }
    )

async def notify_comment(post_id: str, user_id: str, commenter_username: str, comment_text: str):
    """Notify user when post gets a comment"""
    await broadcast_notification(
        "post_commented",
        user_id,
        {
            "post_id": post_id,
            "commenter_id": user_id,
            "commenter_username": commenter_username,
            "comment_text": comment_text,
            "message": f"{commenter_username} commented on your post"
        }
    )
