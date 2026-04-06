from fastapi import APIRouter, HTTPException, status
from bson import ObjectId
from app.db import get_database
from app.services import RecommendationEngine
from app.services.cache import CacheService, RedisCache
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/feed", tags=["feed"])

@router.get("/{user_id}")
async def get_personalized_feed(user_id: str, skip: int = 0, limit: int = 20):
    """Get personalized feed based on user interests and engagements"""
    db = get_database()
    
    try:
        # Check cache first
        cached_feed = await CacheService.get_user_feed(user_id)
        if cached_feed and skip == 0:
            logger.info(f"✓ Returning cached feed for user {user_id}")
            return cached_feed
        
        # Get user
        user = await db["users"].find_one({"_id": ObjectId(user_id)})
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Get posts from users they follow
        following_ids = user.get("following", [])
        
        posts = []
        
        # If user follows someone, get their posts
        if following_ids:
            posts = await db["posts"].find(
                {"user_id": {"$in": following_ids}}
            ).sort("created_at", -1).skip(skip).limit(limit).to_list(None)
        
        # If not enough posts, fill with trending/popular posts
        if len(posts) < limit:
            exclude_ids = following_ids + [user_id]
            popular_posts = await db["posts"].find(
                {"user_id": {"$nin": exclude_ids}}
            ).sort("created_at", -1).limit(limit - len(posts)).to_list(None)
            
            posts.extend(popular_posts)
        
        # Format response
        feed_posts = []
        for post in posts:
            try:
                user_info = await db["users"].find_one({"_id": ObjectId(post["user_id"])})
                
                feed_posts.append({
                    "id": str(post["_id"]),
                    "user": {
                        "id": str(user_info["_id"]),
                        "username": user_info.get("username"),
                        "profile_picture": user_info.get("profile_picture")
                    },
                    "caption": post.get("caption"),
                    "image_url": post.get("image_url"),
                    "hashtags": post.get("hashtags", []),
                    "likes_count": len(post.get("likes", [])),
                    "comments_count": len(post.get("comments", [])),
                    "is_liked": user_id in post.get("likes", []),
                    "created_at": post.get("created_at"),
                })
            except Exception as e:
                logger.error(f"Error formatting post: {e}")
                continue
        
        # Cache the feed
        if skip == 0 and feed_posts:
            await CacheService.cache_user_feed(user_id, feed_posts)
        
        return feed_posts
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
