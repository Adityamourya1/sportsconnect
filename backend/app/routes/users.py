from fastapi import APIRouter, HTTPException, status
from bson import ObjectId
from app.db import get_database
from app.schemas import UserProfile, UpdateProfileRequest
from app.utils import serialize_doc

router = APIRouter(prefix="/api/users", tags=["users"])

@router.get("/{user_id}", response_model=UserProfile)
async def get_user_profile(user_id: str):
    """Get user profile"""
    db = get_database()
    
    try:
        user = await db["users"].find_one({"_id": ObjectId(user_id)})
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Get post count
        posts_count = await db["posts"].count_documents({"user_id": user_id})
        
        return UserProfile(
            id=str(user["_id"]),
            username=user.get("username"),
            email=user.get("email"),
            bio=user.get("bio"),
            profile_picture=user.get("profile_picture"),
            interests=user.get("interests", []),
            followers_count=len(user.get("followers", [])),
            following_count=len(user.get("following", [])),
            posts_count=posts_count,
            role=user.get("role"),
            created_at=user.get("created_at")
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.put("/{user_id}", response_model=UserProfile)
async def update_user_profile(user_id: str, request: UpdateProfileRequest):
    """Update user profile"""
    db = get_database()
    
    try:
        update_data = {}
        if request.username:
            update_data["username"] = request.username
        if request.bio is not None:
            update_data["bio"] = request.bio
        if request.interests is not None:
            update_data["interests"] = request.interests
        if request.profile_picture:
            update_data["profile_picture"] = request.profile_picture
        
        result = await db["users"].find_one_and_update(
            {"_id": ObjectId(user_id)},
            {"$set": update_data},
            return_document=True
        )
        
        if not result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        posts_count = await db["posts"].count_documents({"user_id": user_id})
        
        return UserProfile(
            id=str(result["_id"]),
            username=result.get("username"),
            email=result.get("email"),
            bio=result.get("bio"),
            profile_picture=result.get("profile_picture"),
            interests=result.get("interests", []),
            followers_count=len(result.get("followers", [])),
            following_count=len(result.get("following", [])),
            posts_count=posts_count,
            role=result.get("role"),
            created_at=result.get("created_at")
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.post("/{user_id}/follow/{target_user_id}")
async def follow_user(user_id: str, target_user_id: str):
    """Follow a user"""
    db = get_database()
    
    try:
        # Add target_user_id to follower's following list
        await db["users"].update_one(
            {"_id": ObjectId(user_id)},
            {"$addToSet": {"following": target_user_id}}
        )
        
        # Add user_id to target's followers list
        await db["users"].update_one(
            {"_id": ObjectId(target_user_id)},
            {"$addToSet": {"followers": user_id}}
        )
        
        return {"message": "User followed successfully"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.post("/{user_id}/unfollow/{target_user_id}")
async def unfollow_user(user_id: str, target_user_id: str):
    """Unfollow a user"""
    db = get_database()
    
    try:
        # Remove target_user_id from follower's following list
        await db["users"].update_one(
            {"_id": ObjectId(user_id)},
            {"$pull": {"following": target_user_id}}
        )
        
        # Remove user_id from target's followers list
        await db["users"].update_one(
            {"_id": ObjectId(target_user_id)},
            {"$pull": {"followers": user_id}}
        )
        
        return {"message": "User unfollowed successfully"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.get("/{user_id}/followers")
async def get_followers(user_id: str, skip: int = 0, limit: int = 20):
    """Get user's followers"""
    db = get_database()
    
    try:
        user = await db["users"].find_one({"_id": ObjectId(user_id)})
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        followers_ids = user.get("followers", [])[skip:skip + limit]
        followers = []
        
        for follower_id in followers_ids:
            follower = await db["users"].find_one({"_id": ObjectId(follower_id)})
            if follower:
                followers.append({
                    "id": str(follower["_id"]),
                    "username": follower.get("username"),
                    "profile_picture": follower.get("profile_picture")
                })
        
        return followers
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.get("/{user_id}/following")
async def get_following(user_id: str, skip: int = 0, limit: int = 20):
    """Get users that user is following"""
    db = get_database()
    
    try:
        user = await db["users"].find_one({"_id": ObjectId(user_id)})
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        following_ids = user.get("following", [])[skip:skip + limit]
        following = []
        
        for following_id in following_ids:
            following_user = await db["users"].find_one({"_id": ObjectId(following_id)})
            if following_user:
                following.append({
                    "id": str(following_user["_id"]),
                    "username": following_user.get("username"),
                    "profile_picture": following_user.get("profile_picture")
                })
        
        return following
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
