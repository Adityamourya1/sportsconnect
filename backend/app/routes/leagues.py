from fastapi import APIRouter, HTTPException, status
from bson import ObjectId
from app.db import get_database

router = APIRouter(prefix="/api/leagues", tags=["leagues"])

SPORTS_LEAGUES = [
    {
        "name": "IPL",
        "sport": "cricket",
        "description": "Indian Premier League",
    },
    {
        "name": "Premier League",
        "sport": "football",
        "description": "English Football League",
    },
    {
        "name": "NBA",
        "sport": "basketball",
        "description": "National Basketball Association",
    },
    {
        "name": "La Liga",
        "sport": "football",
        "description": "Spanish Football League",
    },
    {
        "name": "Serie A",
        "sport": "football",
        "description": "Italian Football League",
    },
]

@router.get("/")
async def get_all_leagues(skip: int = 0, limit: int = 50):
    """Get all sports leagues"""
    db = get_database()
    
    try:
        leagues = await db["leagues"].find({}).skip(skip).limit(limit).to_list(None)
        
        if not leagues:
            # Initialize default leagues
            for league in SPORTS_LEAGUES:
                league_data = {
                    "name": league["name"],
                    "sport": league["sport"],
                    "description": league["description"],
                    "followers": [],
                    "posts": [],
                }
                await db["leagues"].insert_one(league_data)
            
            leagues = SPORTS_LEAGUES
        
        return [{
            "id": str(league.get("_id", "")),
            "name": league.get("name"),
            "sport": league.get("sport"),
            "description": league.get("description"),
            "followers_count": len(league.get("followers", [])),
            "posts_count": len(league.get("posts", [])),
        } for league in leagues]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.post("/{league_id}/follow/{user_id}")
async def follow_league(league_id: str, user_id: str):
    """Follow a league"""
    db = get_database()
    
    try:
        result = await db["leagues"].find_one_and_update(
            {"_id": ObjectId(league_id)},
            {"$addToSet": {"followers": user_id}},
            return_document=True
        )
        
        if not result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="League not found"
            )
        
        return {"message": "League followed successfully"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.post("/{league_id}/unfollow/{user_id}")
async def unfollow_league(league_id: str, user_id: str):
    """Unfollow a league"""
    db = get_database()
    
    try:
        result = await db["leagues"].find_one_and_update(
            {"_id": ObjectId(league_id)},
            {"$pull": {"followers": user_id}},
            return_document=True
        )
        
        if not result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="League not found"
            )
        
        return {"message": "League unfollowed successfully"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.get("/{league_id}/posts")
async def get_league_posts(league_id: str, skip: int = 0, limit: int = 20):
    """Get posts from a league"""
    db = get_database()
    
    try:
        league = await db["leagues"].find_one({"_id": ObjectId(league_id)})
        if not league:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="League not found"
            )
        
        # Get posts with matching league hashtags
        league_name = league.get("name", "")
        posts = await db["posts"].find(
            {"hashtags": {"$regex": league_name, "$options": "i"}}
        ).sort("created_at", -1).skip(skip).limit(limit).to_list(None)
        
        return [{
            "id": str(post["_id"]),
            "caption": post.get("caption"),
            "image_url": post.get("image_url"),
            "likes_count": len(post.get("likes", [])),
            "comments_count": len(post.get("comments", [])),
        } for post in posts]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
