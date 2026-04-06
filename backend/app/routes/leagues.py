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

@router.get("/{user_id}/recommended")
async def get_recommended_leagues(user_id: str, limit: int = 10):
    """Get recommended leagues based on user interests"""
    db = get_database()
    
    try:
        from app.services import RecommendationEngine
        
        # Get user
        user = await db["users"].find_one({"_id": ObjectId(user_id)})
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        user_interests = user.get("interests", [])
        
        if not user_interests:
            # Return popular leagues if no interests
            leagues = await db["leagues"].find({}).limit(limit).to_list(None)
        else:
            # Get all leagues
            all_leagues = await db["leagues"].find({}).to_list(None)
            
            # Use recommendation engine to get interest-based leagues
            rec_engine = RecommendationEngine()
            recommended = await rec_engine.recommend_leagues_by_interests(
                user_interests, all_leagues, top_n=limit
            )
            
            leagues = [rec["league"] for rec in recommended]
        
        # Format response
        formatted_leagues = []
        for league in leagues:
            formatted_leagues.append({
                "id": str(league.get("_id", "")),
                "name": league.get("name"),
                "sport": league.get("sport"),
                "description": league.get("description"),
                "logo_url": league.get("logo_url"),
                "followers_count": len(league.get("followers", [])),
                "posts_count": len(league.get("posts", [])),
                "is_following": user_id in league.get("followers", [])
            })
        
        return formatted_leagues
    
    except ObjectId as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid user ID"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
