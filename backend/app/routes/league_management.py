from fastapi import APIRouter, HTTPException, Depends
from bson import ObjectId
from datetime import datetime
from typing import List, Optional
from app.db import get_database
from app.models.models import League, LeagueApplication, Notification

league_router = APIRouter(prefix="/api/leagues-management", tags=["League Management"])

# Update user role
@league_router.post("/{user_id}/set-role/{role}")
async def set_user_role(user_id: str, role: str):
    """Set user role to scout, league_owner, or regular_player"""
    if role not in ["scout", "league_owner", "regular_player"]:
        raise HTTPException(status_code=400, detail="Invalid role. Must be 'scout', 'league_owner', or 'regular_player'")
    
    db = get_database()
    result = await db["users"].update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"role": role}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {"message": f"User role set to {role}", "role": role}

# Create new league
@league_router.post("/{user_id}/create-league")
async def create_league(user_id: str, league_data: dict):
    """Create a new league"""
    db = get_database()
    user = await db["users"].find_one({"_id": ObjectId(user_id)})
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user.get("role") not in ["scout", "league_owner"]:
        raise HTTPException(status_code=403, detail="Only scouts and league owners can create leagues")
    
    league = {
        "name": league_data.get("name"),
        "description": league_data.get("description"),
        "sport": league_data.get("sport"),
        "owner_id": user_id,
        "logo_url": league_data.get("logo_url"),
        "followers": [],
        "posts": [],
        "players": [],
        "applications": [],
        "created_at": datetime.utcnow()
    }
    
    result = await db["leagues"].insert_one(league)
    
    # Add league to user's owned_leagues
    await db["users"].update_one(
        {"_id": ObjectId(user_id)},
        {"$push": {"owned_leagues": str(result.inserted_id)}}
    )
    
    return {
        "message": "League created successfully",
        "league_id": str(result.inserted_id),
        "name": league["name"],
        "description": league["description"],
        "sport": league["sport"],
        "owner_id": league["owner_id"],
        "logo_url": league["logo_url"],
        "created_at": league["created_at"].isoformat()
    }

# Apply to league
@league_router.post("/{user_id}/apply-league/{league_id}")
async def apply_to_league(user_id: str, league_id: str):
    """Player applies to a league"""
    db = get_database()
    user = await db["users"].find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    league = await db["leagues"].find_one({"_id": ObjectId(league_id)})
    if not league:
        raise HTTPException(status_code=404, detail="League not found")
    
    # Check if already applied
    existing_application = next(
        (app for app in league.get("applications", []) if app["user_id"] == user_id),
        None
    )
    if existing_application:
        raise HTTPException(status_code=400, detail="Already applied to this league")
    
    # Check if already a player
    if user_id in league.get("players", []):
        raise HTTPException(status_code=400, detail="Already a player in this league")
    
    application = {
        "user_id": user_id,
        "applied_at": datetime.utcnow(),
        "status": "pending"
    }
    
    await db["leagues"].update_one(
        {"_id": ObjectId(league_id)},
        {"$push": {"applications": application}}
    )
    
    # Notify league owner
    owner_id = league.get("owner_id")
    if not owner_id:
        raise HTTPException(status_code=400, detail="League has no owner")
    owner = await db["users"].find_one({"_id": ObjectId(owner_id)})
    notification = {
        "user_id": owner_id,
        "type": "league_application",
        "actor_id": user_id,
        "league_id": league_id,
        "message": f"{user.get('username')} applied to join {league.get('name')}",
        "is_read": False,
        "created_at": datetime.utcnow()
    }
    await db["notifications"].insert_one(notification)
    
    return {"message": "Application submitted successfully", "league_id": league_id}

# Get applications for league (owner only)
@league_router.get("/{user_id}/league/{league_id}/applications")
async def get_league_applications(user_id: str, league_id: str):
    """Get list of applications for a league"""
    db = get_database()
    league = await db["leagues"].find_one({"_id": ObjectId(league_id)})
    if not league:
        raise HTTPException(status_code=404, detail="League not found")
    
    owner_id = league.get("owner_id")
    if not owner_id or owner_id != user_id:
        raise HTTPException(status_code=403, detail="Only league owner can view applications")
    
    applications = league.get("applications", [])
    
    # Enrich with user data
    enriched_applications = []
    for app in applications:
        applicant = await db["users"].find_one({"_id": ObjectId(app["user_id"])})
        if applicant:
            enriched_applications.append({
                **app,
                "username": applicant.get("username"),
                "profile_picture": applicant.get("profile_picture"),
                "applied_at": app["applied_at"].isoformat() if isinstance(app["applied_at"], datetime) else app["applied_at"]
            })
    
    return {
        "league_id": league_id,
        "league_name": league.get("name"),
        "applications": enriched_applications,
        "total": len(enriched_applications)
    }

# Accept application
@league_router.post("/{user_id}/league/{league_id}/application/{player_id}/accept")
async def accept_application(user_id: str, league_id: str, player_id: str):
    """Accept a player's application"""
    db = get_database()
    league = await db["leagues"].find_one({"_id": ObjectId(league_id)})
    if not league:
        raise HTTPException(status_code=404, detail="League not found")
    
    owner_id = league.get("owner_id")
    if not owner_id or owner_id != user_id:
        raise HTTPException(status_code=403, detail="Only league owner can accept applications")
    
    # Update application status
    await db["leagues"].update_one(
        {"_id": ObjectId(league_id), "applications.user_id": player_id},
        {"$set": {"applications.$.status": "accepted"}}
    )
    
    # Add player to league players
    await db["leagues"].update_one(
        {"_id": ObjectId(league_id)},
        {"$addToSet": {"players": player_id}}
    )
    
    player = await db["users"].find_one({"_id": ObjectId(player_id)})
    league_owner = await db["users"].find_one({"_id": ObjectId(user_id)})
    
    # Notify player
    notification = {
        "user_id": player_id,
        "type": "league_accepted",
        "actor_id": user_id,
        "league_id": league_id,
        "message": f"Your application to {league.get('name')} has been accepted",
        "is_read": False,
        "created_at": datetime.utcnow()
    }
    await db["notifications"].insert_one(notification)
    
    return {"message": "Application accepted", "player_id": player_id, "league_id": league_id}

# Reject application
@league_router.post("/{user_id}/league/{league_id}/application/{player_id}/reject")
async def reject_application(user_id: str, league_id: str, player_id: str):
    """Reject a player's application"""
    db = get_database()
    league = await db["leagues"].find_one({"_id": ObjectId(league_id)})
    if not league:
        raise HTTPException(status_code=404, detail="League not found")
    
    owner_id = league.get("owner_id")
    if not owner_id or owner_id != user_id:
        raise HTTPException(status_code=403, detail="Only league owner can reject applications")
    
    # Update application status
    await db["leagues"].update_one(
        {"_id": ObjectId(league_id), "applications.user_id": player_id},
        {"$set": {"applications.$.status": "rejected"}}
    )
    
    player = await db["users"].find_one({"_id": ObjectId(player_id)})
    
    # Notify player
    notification = {
        "user_id": player_id,
        "type": "league_rejected",
        "actor_id": user_id,
        "league_id": league_id,
        "message": f"Your application to {league.get('name')} has been rejected",
        "is_read": False,
        "created_at": datetime.utcnow()
    }
    await db["notifications"].insert_one(notification)
    
    return {"message": "Application rejected", "player_id": player_id, "league_id": league_id}

# Get user's owned leagues
@league_router.get("/{user_id}/owned-leagues")
async def get_owned_leagues(user_id: str):
    """Get all leagues owned by user"""
    db = get_database()
    user = await db["users"].find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    owned_league_ids = user.get("owned_leagues", [])
    leagues = []
    
    for league_id in owned_league_ids:
        league = await db["leagues"].find_one({"_id": ObjectId(league_id)})
        if league:
            leagues.append({
                "_id": str(league["_id"]),
                "name": league.get("name"),
                "description": league.get("description"),
                "sport": league.get("sport"),
                "logo_url": league.get("logo_url"),
                "players_count": len(league.get("players", [])),
                "applications_count": len([a for a in league.get("applications", []) if a.get("status") == "pending"]),
                "created_at": league.get("created_at").isoformat() if isinstance(league.get("created_at"), datetime) else league.get("created_at")
            })
    
    return {"owned_leagues": leagues, "total": len(leagues)}

# Get user's league applications (as player)
@league_router.get("/{user_id}/my-league-applications")
async def get_my_league_applications(user_id: str):
    """Get all league applications for a player"""
    db = get_database()
    user = await db["users"].find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Find all leagues where user has applied
    leagues = await db["leagues"].find(
        {"applications.user_id": user_id}
    ).to_list(None)
    
    applications = []
    for league in leagues:
        for app in league.get("applications", []):
            if app["user_id"] == user_id:
                applications.append({
                    "league_id": str(league["_id"]),
                    "league_name": league.get("name"),
                    "sport": league.get("sport"),
                    "status": app.get("status"),
                    "applied_at": app.get("applied_at").isoformat() if isinstance(app.get("applied_at"), datetime) else app.get("applied_at"),
                    "logo_url": league.get("logo_url")
                })
    
    return {"applications": applications, "total": len(applications)}

# Get all available leagues
@league_router.get("/available-leagues")
async def get_available_leagues():
    """Get all available leagues to browse"""
    db = get_database()
    leagues = await db["leagues"].find().to_list(None)
    
    result = []
    for league in leagues:
        owner_id = league.get("owner_id")
        owner = None
        if owner_id:
            try:
                owner = await db["users"].find_one({"_id": ObjectId(owner_id)})
            except Exception:
                owner = None
        
        result.append({
            "_id": str(league["_id"]),
            "name": league.get("name"),
            "description": league.get("description"),
            "sport": league.get("sport"),
            "logo_url": league.get("logo_url"),
            "owner_name": owner.get("username") if owner else "Unknown",
            "players_count": len(league.get("players", [])),
            "created_at": league.get("created_at").isoformat() if isinstance(league.get("created_at"), datetime) else league.get("created_at")
        })
    
    return {"leagues": result, "total": len(result)}

# Delete league
@league_router.delete("/{user_id}/league/{league_id}")
async def delete_league(user_id: str, league_id: str):
    """Delete a league (owner only)"""
    db = get_database()
    league = await db["leagues"].find_one({"_id": ObjectId(league_id)})
    if not league:
        raise HTTPException(status_code=404, detail="League not found")
    
    owner_id = league.get("owner_id")
    if not owner_id or owner_id != user_id:
        raise HTTPException(status_code=403, detail="Only league owner can delete this league")
    
    # Delete the league
    await db["leagues"].delete_one({"_id": ObjectId(league_id)})
    
    # Remove league from user's owned_leagues
    await db["users"].update_one(
        {"_id": ObjectId(user_id)},
        {"$pull": {"owned_leagues": league_id}}
    )
    
    return {"message": "League deleted successfully", "league_id": league_id}
