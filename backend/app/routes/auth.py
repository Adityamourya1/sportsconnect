from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import JSONResponse
from bson import ObjectId
from app.db import get_database
from app.utils import hash_password, verify_password, create_access_token, create_refresh_token
from app.schemas import SignupRequest, LoginRequest, TokenResponse

router = APIRouter(prefix="/api/auth", tags=["auth"])

async def get_user_from_db(db, email: str):
    """Get user from database"""
    return await db["users"].find_one({"email": email})

@router.post("/signup", response_model=TokenResponse)
async def signup(request: SignupRequest):
    """User signup endpoint"""
    db = get_database()
    
    # Check if user exists
    existing_user = await get_user_from_db(db, request.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Check if username exists
    existing_username = await db["users"].find_one({"username": request.username})
    if existing_username:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already taken"
        )
    
    # Create user
    user_data = {
        "username": request.username,
        "email": request.email,
        "password_hash": hash_password(request.password),
        "interests": request.interests,
        "bio": "",
        "profile_picture": None,
        "followers": [],
        "following": [],
        "created_at": __import__("datetime").datetime.utcnow(),
        "is_verified": False,
        "is_active": True,
    }
    
    result = await db["users"].insert_one(user_data)
    user_id = str(result.inserted_id)
    
    # Create tokens
    access_token = create_access_token({"sub": user_id, "email": request.email})
    refresh_token = create_refresh_token({"sub": user_id})
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user_id=user_id
    )

@router.post("/login", response_model=TokenResponse)
async def login(request: LoginRequest):
    """User login endpoint"""
    db = get_database()
    
    # Find user
    user = await get_user_from_db(db, request.email)
    if not user or not verify_password(request.password, user.get("password_hash", "")):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    user_id = str(user["_id"])
    
    # Create tokens
    access_token = create_access_token({"sub": user_id, "email": request.email})
    refresh_token = create_refresh_token({"sub": user_id})
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user_id=user_id
    )

@router.post("/refresh")
async def refresh_token(refresh_token: str):
    """Refresh access token"""
    from app.utils import decode_token
    
    payload = decode_token(refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )
    
    user_id = payload.get("sub")
    new_access_token = create_access_token({"sub": user_id})
    
    return {"access_token": new_access_token, "token_type": "bearer"}

@router.get("/me")
async def get_current_user(authorization: str = None):
    """Get current user info"""
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated"
        )
    
    try:
        token = authorization.split(" ")[1]
        from app.utils import decode_token
        payload = decode_token(token)
        if not payload:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token expired"
            )
        
        db = get_database()
        user = await db["users"].find_one({"_id": ObjectId(payload.get("sub"))})
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        return {
            "id": str(user["_id"]),
            "username": user["username"],
            "email": user["email"],
            "bio": user.get("bio"),
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )
