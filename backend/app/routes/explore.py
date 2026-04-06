from fastapi import APIRouter, HTTPException, status
from bson import ObjectId
from app.db import get_database

router = APIRouter(prefix="/api/explore", tags=["explore"])

@router.get("/trending/posts")
async def get_trending_posts(limit: int = 20):
    """Get trending posts across platform"""
    db = get_database()
    
    try:
        # Get posts sorted by engagement
        posts = await db["posts"].find(
            {}
        ).to_list(None)
        
        # Sort by engagement score
        def engagement_score(post):
            likes = len(post.get("likes", []))
            comments = len(post.get("comments", []))
            shares = post.get("shares", 0)
            return likes * 1 + comments * 2 + shares * 3
        
        posts.sort(key=engagement_score, reverse=True)
        posts = posts[:limit]
        
        # Format response
        trending = []
        for post in posts:
            user = await db["users"].find_one({"_id": ObjectId(post["user_id"])})
            
            trending.append({
                "id": str(post["_id"]),
                "user": {
                    "id": str(user["_id"]),
                    "username": user.get("username"),
                },
                "caption": post.get("caption"),
                "image_url": post.get("image_url"),
                "likes_count": len(post.get("likes", [])),
                "comments_count": len(post.get("comments", [])),
            })
        
        return trending
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.get("/suggested-users/{user_id}")
async def get_suggested_users(user_id: str, limit: int = 10):
    """Get suggested users to follow"""
    db = get_database()
    
    try:
        user = await db["users"].find_one({"_id": ObjectId(user_id)})
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Get users with similar interests
        similar_users = await db["users"].find(
            {
                "_id": {"$ne": ObjectId(user_id)},
                "interests": {"$in": user.get("interests", [])},
            }
        ).limit(limit).to_list(None)
        
        # Format response
        suggestions = [{
            "id": str(u["_id"]),
            "username": u.get("username"),
            "profile_picture": u.get("profile_picture"),
            "bio": u.get("bio"),
            "mutual_interests": list(set(u.get("interests", [])) & set(user.get("interests", [])))
        } for u in similar_users]
        
        return suggestions
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.get("/hashtags/trending")
async def get_trending_hashtags(limit: int = 20):
    """Get trending hashtags"""
    db = get_database()
    
    try:
        # Aggregate hashtags from all posts
        posts = await db["posts"].find({}).to_list(None)
        
        hashtag_count = {}
        for post in posts:
            for hashtag in post.get("hashtags", []):
                hashtag_count[hashtag] = hashtag_count.get(hashtag, 0) + 1
        
        # Sort and return top hashtags
        trending = sorted(hashtag_count.items(), key=lambda x: x[1], reverse=True)[:limit]
        
        return [{
            "hashtag": tag,
            "count": count
        } for tag, count in trending]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.get("/search")
async def search_content(q: str, search_type: str = "all"):
    """Search for users, posts, or hashtags"""
    db = get_database()
    
    try:
        results = {}
        
        if search_type in ["all", "users"]:
            users = await db["users"].find(
                {"username": {"$regex": q, "$options": "i"}}
            ).limit(10).to_list(None)
            
            results["users"] = [{
                "id": str(u["_id"]),
                "username": u.get("username"),
                "profile_picture": u.get("profile_picture"),
            } for u in users]
        
        if search_type in ["all", "posts"]:
            posts = await db["posts"].find(
                {"caption": {"$regex": q, "$options": "i"}}
            ).limit(10).to_list(None)
            
            results["posts"] = [{
                "id": str(p["_id"]),
                "caption": p.get("caption"),
                "image_url": p.get("image_url"),
            } for p in posts]
        
        if search_type in ["all", "hashtags"]:
            posts = await db["posts"].find(
                {"hashtags": {"$regex": q, "$options": "i"}}
            ).to_list(None)
            
            hashtags = set()
            for post in posts:
                for tag in post.get("hashtags", []):
                    if q.lower() in tag.lower():
                        hashtags.add(tag)
            
            results["hashtags"] = list(hashtags)[:10]
        
        return results
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
