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
        user_interests = user.get("interests", [])
        
        posts = []
        
        # If user follows someone, get their posts
        if following_ids:
            posts = await db["posts"].find(
                {"user_id": {"$in": following_ids}}
            ).sort("created_at", -1).skip(skip).limit(limit).to_list(None)
        
        # If not enough posts from following, add interest-based recommendations
        if len(posts) < limit and user_interests:
            exclude_ids = following_ids + [user_id]
            exclude_post_ids = [str(p["_id"]) for p in posts]
            
            # Get all available posts
            all_posts = await db["posts"].find(
                {"user_id": {"$nin": exclude_ids}}
            ).sort("created_at", -1).to_list(None)
            
            # Use recommendation engine to get interest-based posts
            rec_engine = RecommendationEngine()
            recommended = await rec_engine.recommend_posts_by_interests(
                user_id, user_interests, all_posts, top_n=limit - len(posts)
            )
            
            for rec in recommended:
                if str(rec["post"]["_id"]) not in exclude_post_ids:
                    posts.append(rec["post"])
                    if len(posts) >= limit:
                        break
        
        # If still not enough posts, fill with trending/popular posts
        if len(posts) < limit:
            exclude_ids = following_ids + [user_id]
            exclude_post_ids = [str(p["_id"]) for p in posts]
            
            popular_posts = await db["posts"].find(
                {"user_id": {"$nin": exclude_ids}, "_id": {"$nin": [ObjectId(pid) for pid in exclude_post_ids]}}
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

@router.get("/{user_id}/recommendations")
async def get_recommendations(user_id: str, skip: int = 0, limit: int = 20):
    """Get personalized recommendations based on user interests"""
    db = get_database()
    
    try:
        # Get user
        user = await db["users"].find_one({"_id": ObjectId(user_id)})
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        user_interests = user.get("interests", [])
        
        # If no interests, return trending posts
        if not user_interests:
            trending_posts = await db["posts"].find(
                {"user_id": {"$ne": user_id}}
            ).sort("created_at", -1).skip(skip).limit(limit).to_list(None)
            
            posts = []
            for post in trending_posts:
                try:
                    user_info = await db["users"].find_one({"_id": ObjectId(post["user_id"])})
                    posts.append({
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
                        "recommendation_type": "trending"
                    })
                except Exception as e:
                    logger.error(f"Error formatting post: {e}")
                    continue
            
            return posts
        
        # Get all posts except from user and followed users
        exclude_ids = user.get("following", []) + [user_id]
        all_posts = await db["posts"].find(
            {"user_id": {"$nin": exclude_ids}}
        ).sort("created_at", -1).to_list(None)
        
        # Use recommendation engine
        rec_engine = RecommendationEngine()
        recommended = await rec_engine.recommend_posts_by_interests(
            user_id, user_interests, all_posts, top_n=limit + skip
        )
        
        # Apply pagination
        paginated_recs = recommended[skip:skip + limit]
        
        posts = []
        for rec in paginated_recs:
            try:
                post = rec["post"]
                user_info = await db["users"].find_one({"_id": ObjectId(post["user_id"])})
                posts.append({
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
                    "recommendation_type": "interest-based",
                    "match_score": rec["score"]
                })
            except Exception as e:
                logger.error(f"Error formatting post: {e}")
                continue
        
        return posts
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.get("/{user_id}/recommended-users")
async def get_recommended_users(user_id: str, limit: int = 10):
    """Get recommended users based on interests and activity"""
    db = get_database()
    
    try:
        user = await db["users"].find_one({"_id": ObjectId(user_id)})
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        user_interests = user.get("interests", [])
        following_ids = user.get("following", [])
        
        # Find users with matching interests
        query = {"_id": {"$nin": [ObjectId(user_id)] + [ObjectId(fid) if isinstance(fid, str) and len(fid) == 24 else fid for fid in following_ids]}}
        
        if user_interests:
            query["interests"] = {"$in": user_interests}
        
        recommended_users = await db["users"].find(query).limit(limit).to_list(None)
        
        result = []
        for rec_user in recommended_users:
            result.append({
                "id": str(rec_user["_id"]),
                "username": rec_user.get("username"),
                "profile_picture": rec_user.get("profile_picture"),
                "bio": rec_user.get("bio"),
                "interests": rec_user.get("interests", []),
                "followers_count": len(rec_user.get("followers", []))
            })
        
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
