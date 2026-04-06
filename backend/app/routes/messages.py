from fastapi import APIRouter, HTTPException, status
from bson import ObjectId
from datetime import datetime
from app.db import get_database
from app.schemas import SendMessageRequest

router = APIRouter(prefix="/api/messages", tags=["messages"])

def generate_chat_id(user1_id: str, user2_id: str) -> str:
    """Generate a consistent chat ID from two user IDs"""
    ids = sorted([user1_id, user2_id])
    return f"{ids[0]}_{ids[1]}"

@router.post("/send")
async def send_message(request: SendMessageRequest):
    """Send a message"""
    db = get_database()
    
    try:
        chat_id = generate_chat_id(request.sender_id, request.receiver_id)
        
        message = {
            "sender_id": request.sender_id,
            "receiver_id": request.receiver_id,
            "chat_id": chat_id,
            "text": request.text,
            "image_url": request.image_url,
            "is_read": False,
            "created_at": datetime.utcnow(),
        }
        
        result = await db["messages"].insert_one(message)
        
        return {
            "id": str(result.inserted_id),
            "message": "Message sent successfully"
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.get("/{chat_id}")
async def get_chat_messages(chat_id: str, skip: int = 0, limit: int = 50):
    """Get messages from a chat"""
    db = get_database()
    
    try:
        messages = await db["messages"].find(
            {"chat_id": chat_id}
        ).sort("created_at", 1).skip(skip).limit(limit).to_list(None)
        
        return [{
            "id": str(msg["_id"]),
            "sender_id": msg.get("sender_id"),
            "receiver_id": msg.get("receiver_id"),
            "text": msg.get("text"),
            "image_url": msg.get("image_url"),
            "is_read": msg.get("is_read", False),
            "created_at": msg.get("created_at"),
        } for msg in messages]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.get("/{user_id}/conversations")
async def get_conversations(user_id: str):
    """Get all conversations for a user"""
    db = get_database()
    
    try:
        # Get unique chat IDs where user is involved
        messages = await db["messages"].find(
            {"$or": [{"sender_id": user_id}, {"receiver_id": user_id}]}
        ).sort("created_at", -1).to_list(None)
        
        conversations = {}
        for msg in messages:
            chat_id = msg.get("chat_id")
            if chat_id not in conversations:
                # Determine the other user
                other_user_id = msg.get("receiver_id") if msg.get("sender_id") == user_id else msg.get("sender_id")
                
                conversations[chat_id] = {
                    "chat_id": chat_id,
                    "other_user_id": other_user_id,
                    "last_message": msg.get("text"),
                    "last_message_time": msg.get("created_at"),
                }
        
        # Fetch user info for each conversation
        for chat_id, convo in conversations.items():
            try:
                user_doc = await db["users"].find_one({"_id": ObjectId(convo["other_user_id"])})
                if user_doc:
                    convo["other_user_username"] = user_doc.get("username", "Unknown")
                    convo["other_user_profile_picture"] = user_doc.get("profile_picture")
            except:
                pass
        
        return list(conversations.values())
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.put("/{message_id}/read")
async def mark_message_as_read(message_id: str):
    """Mark message as read"""
    db = get_database()
    
    try:
        result = await db["messages"].find_one_and_update(
            {"_id": ObjectId(message_id)},
            {"$set": {"is_read": True}},
            return_document=True
        )
        
        if not result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Message not found"
            )
        
        return {"message": "Message marked as read"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
