from fastapi import APIRouter, HTTPException, status
from bson import ObjectId
from datetime import datetime
from app.db import get_database
from app.schemas import NotificationCreateRequest

router = APIRouter(prefix="/api/notifications", tags=["notifications"])

@router.get("/{user_id}")
async def get_notifications(user_id: str, skip: int = 0, limit: int = 20):
    """Get user notifications"""
    db = get_database()
    
    try:
        notifications = await db["notifications"].find(
            {"user_id": user_id}
        ).sort("created_at", -1).skip(skip).limit(limit).to_list(None)
        
        return [{
            "id": str(notif["_id"]),
            "type": notif.get("type"),
            "actor_id": notif.get("actor_id"),
            "message": notif.get("message"),
            "is_read": notif.get("is_read", False),
            "created_at": notif.get("created_at"),
        } for notif in notifications]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.post("/create")
async def create_notification(request: NotificationCreateRequest):
    """Create a notification"""
    db = get_database()
    
    try:
        notification = {
            "user_id": request.user_id,
            "type": request.notif_type,
            "actor_id": request.actor_id,
            "post_id": request.post_id,
            "message": request.message,
            "is_read": False,
            "created_at": datetime.utcnow(),
        }
        
        result = await db["notifications"].insert_one(notification)
        
        return {
            "id": str(result.inserted_id),
            "message": "Notification created"
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.put("/{notification_id}/read")
async def mark_as_read(notification_id: str):
    """Mark notification as read"""
    db = get_database()
    
    try:
        result = await db["notifications"].find_one_and_update(
            {"_id": ObjectId(notification_id)},
            {"$set": {"is_read": True}},
            return_document=True
        )
        
        if not result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Notification not found"
            )
        
        return {"message": "Notification marked as read"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.get("/{user_id}/unread-count")
async def get_unread_count(user_id: str):
    """Get unread notifications count"""
    db = get_database()
    
    try:
        count = await db["notifications"].count_documents(
            {"user_id": user_id, "is_read": False}
        )
        
        return {"unread_count": count}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
