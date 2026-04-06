from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime, timedelta
from bson import ObjectId
import logging
from typing import List

from app.db import get_database
from app.models.models import Story

logger = logging.getLogger(__name__)
stories_router = APIRouter(prefix="/api/stories", tags=["stories"])

async def get_db():
    """Dependency to get database"""
    return await get_database()

@stories_router.post("/{user_id}/create")
async def create_story(user_id: str, story: Story, db = Depends(get_db)):
    """Create a new story (expires in 24 hours)"""
    try:
        # Set expiration time to 24 hours from now
        story.expires_at = datetime.utcnow() + timedelta(hours=24)
        
        story_dict = story.dict()
        result = await db.stories.insert_one(story_dict)
        
        return {
            "id": str(result.inserted_id),
            "message": "Story created successfully",
            "expires_at": story.expires_at
        }
    except Exception as e:
        logger.error(f"Error creating story: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@stories_router.get("/{user_id}/feed")
async def get_stories_feed(user_id: str, db = Depends(get_db)):
    """Get stories from following users (not expired)"""
    try:
        # Get current user's following list
        user = await db.users.find_one({"_id": ObjectId(user_id)})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        following_ids = user.get("following", [])
        following_ids.append(user_id)  # Include own stories
        
        # Convert to ObjectId objects
        following_oids = [ObjectId(uid) if isinstance(uid, str) else uid for uid in following_ids]
        
        # Get non-expired stories from following users
        current_time = datetime.utcnow()
        stories = await db.stories.find({
            "user_id": {"$in": following_ids},
            "expires_at": {"$gt": current_time}
        }).sort("created_at", -1).to_list(100)
        
        # Get user info for each story
        result = []
        for story in stories:
            story_user = await db.users.find_one({"_id": ObjectId(story["user_id"])})
            result.append({
                "id": str(story["_id"]),
                "user_id": story["user_id"],
                "username": story_user["username"] if story_user else "Unknown",
                "profile_picture": story_user["profile_picture"] if story_user else None,
                "image_url": story["image_url"],
                "caption": story.get("caption"),
                "view_count": len(story.get("viewed_by", [])),
                "created_at": story["created_at"],
                "expires_at": story["expires_at"]
            })
        
        return result
    except Exception as e:
        logger.error(f"Error fetching stories feed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@stories_router.get("/user/{user_id}")
async def get_user_stories(user_id: str, db = Depends(get_db)):
    """Get all non-expired stories from a specific user"""
    try:
        current_time = datetime.utcnow()
        stories = await db.stories.find({
            "user_id": user_id,
            "expires_at": {"$gt": current_time}
        }).sort("created_at", -1).to_list(100)
        
        return [
            {
                "id": str(story["_id"]),
                "image_url": story["image_url"],
                "caption": story.get("caption"),
                "view_count": len(story.get("viewed_by", [])),
                "created_at": story["created_at"],
                "expires_at": story["expires_at"]
            }
            for story in stories
        ]
    except Exception as e:
        logger.error(f"Error fetching user stories: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@stories_router.post("/{story_id}/view")
async def view_story(story_id: str, viewer_id: str, db = Depends(get_db)):
    """Mark a story as viewed"""
    try:
        if not ObjectId.is_valid(story_id):
            raise HTTPException(status_code=400, detail="Invalid story ID")
        
        story = await db.stories.find_one({"_id": ObjectId(story_id)})
        if not story:
            raise HTTPException(status_code=404, detail="Story not found")
        
        # Add viewer if not already viewed
        viewed_by = story.get("viewed_by", [])
        if viewer_id not in viewed_by:
            viewed_by.append(viewer_id)
            await db.stories.update_one(
                {"_id": ObjectId(story_id)},
                {"$set": {"viewed_by": viewed_by}}
            )
        
        return {"message": "Story viewed", "view_count": len(viewed_by)}
    except Exception as e:
        logger.error(f"Error marking story as viewed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@stories_router.delete("/{story_id}")
async def delete_story(story_id: str, user_id: str, db = Depends(get_db)):
    """Delete a story (only owner can delete)"""
    try:
        if not ObjectId.is_valid(story_id):
            raise HTTPException(status_code=400, detail="Invalid story ID")
        
        story = await db.stories.find_one({"_id": ObjectId(story_id)})
        if not story:
            raise HTTPException(status_code=404, detail="Story not found")
        
        if story["user_id"] != user_id:
            raise HTTPException(status_code=403, detail="Can only delete your own stories")
        
        await db.stories.delete_one({"_id": ObjectId(story_id)})
        return {"message": "Story deleted successfully"}
    except Exception as e:
        logger.error(f"Error deleting story: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Cleanup expired stories (can be called periodically)
@stories_router.post("/cleanup/expired")
async def cleanup_expired_stories(db = Depends(get_db)):
    """Remove expired stories"""
    try:
        result = await db.stories.delete_many({
            "expires_at": {"$lt": datetime.utcnow()}
        })
        return {"message": f"Deleted {result.deleted_count} expired stories"}
    except Exception as e:
        logger.error(f"Error cleaning up expired stories: {e}")
        raise HTTPException(status_code=500, detail=str(e))
