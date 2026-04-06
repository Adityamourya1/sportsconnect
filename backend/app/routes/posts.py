from fastapi import APIRouter, HTTPException, status
from bson import ObjectId
from datetime import datetime
from app.db import get_database
from app.schemas import CreatePostRequest, PostResponse, CommentRequest, CommentResponse
from app.utils import serialize_doc

router = APIRouter(prefix="/api/posts", tags=["posts"])

@router.post("/{user_id}", response_model=dict)
async def create_post(user_id: str, request: CreatePostRequest):
    """Create a new post"""
    db = get_database()
    
    try:
        post_data = {
            "user_id": user_id,
            "caption": request.caption,
            "image_url": request.image_url,
            "video_url": request.video_url,
            "tags": request.tags,
            "hashtags": request.hashtags,
            "likes": [],
            "comments": [],
            "shares": 0,
            "ai_generated": request.ai_generated,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
        }
        
        result = await db["posts"].insert_one(post_data)
        
        return {
            "id": str(result.inserted_id),
            "message": "Post created successfully"
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.get("/{post_id}")
async def get_post(post_id: str):
    """Get a specific post"""
    db = get_database()
    
    try:
        post = await db["posts"].find_one({"_id": ObjectId(post_id)})
        if not post:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Post not found"
            )
        
        # Get user info
        user = await db["users"].find_one({"_id": ObjectId(post["user_id"])})
        
        return {
            "id": str(post["_id"]),
            "user": {
                "id": str(user["_id"]),
                "username": user.get("username"),
                "profile_picture": user.get("profile_picture")
            },
            "caption": post.get("caption"),
            "image_url": post.get("image_url"),
            "hashtags": post.get("hashtags", []),
            "likes_count": len(post.get("likes", [])),
            "comments_count": len(post.get("comments", [])),
            "created_at": post.get("created_at"),
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.post("/{post_id}/like/{user_id}")
async def like_post(post_id: str, user_id: str):
    """Like a post"""
    db = get_database()
    
    try:
        result = await db["posts"].find_one_and_update(
            {"_id": ObjectId(post_id)},
            {"$addToSet": {"likes": user_id}},
            return_document=True
        )
        
        if not result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Post not found"
            )
        
        return {"message": "Post liked", "likes_count": len(result.get("likes", []))}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.post("/{post_id}/unlike/{user_id}")
async def unlike_post(post_id: str, user_id: str):
    """Unlike a post"""
    db = get_database()
    
    try:
        result = await db["posts"].find_one_and_update(
            {"_id": ObjectId(post_id)},
            {"$pull": {"likes": user_id}},
            return_document=True
        )
        
        if not result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Post not found"
            )
        
        return {"message": "Post unliked", "likes_count": len(result.get("likes", []))}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.post("/{post_id}/comment/{user_id}")
async def add_comment(post_id: str, user_id: str, request: CommentRequest):
    """Add comment to a post"""
    db = get_database()
    
    try:
        comment = {
            "user_id": user_id,
            "text": request.text,
            "likes": [],
            "created_at": datetime.utcnow(),
        }
        
        result = await db["posts"].find_one_and_update(
            {"_id": ObjectId(post_id)},
            {"$push": {"comments": comment}},
            return_document=True
        )
        
        if not result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Post not found"
            )
        
        return {
            "message": "Comment added",
            "comments_count": len(result.get("comments", []))
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.get("/{user_id}/posts")
async def get_user_posts(user_id: str, skip: int = 0, limit: int = 20):
    """Get all posts by a user"""
    db = get_database()
    
    try:
        posts = await db["posts"].find(
            {"user_id": user_id}
        ).sort("created_at", -1).skip(skip).limit(limit).to_list(None)
        
        return [{
            "id": str(post["_id"]),
            "caption": post.get("caption"),
            "image_url": post.get("image_url"),
            "likes_count": len(post.get("likes", [])),
            "comments_count": len(post.get("comments", [])),
            "created_at": post.get("created_at"),
        } for post in posts]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.delete("/{post_id}/{user_id}")
async def delete_post(post_id: str, user_id: str):
    """Delete a post (only the post owner can delete)"""
    db = get_database()
    
    try:
        post = await db["posts"].find_one({"_id": ObjectId(post_id)})
        
        if not post:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Post not found"
            )
        
        # Check if user is the post owner
        if post.get("user_id") != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only delete your own posts"
            )
        
        result = await db["posts"].delete_one({"_id": ObjectId(post_id)})
        
        if result.deleted_count == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to delete post"
            )
        
        return {"message": "Post deleted successfully"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
