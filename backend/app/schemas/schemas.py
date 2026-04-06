from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime

# ============ AUTH SCHEMAS ============
class SignupRequest(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=8)
    interests: List[str] = []
    
    class Config:
        json_schema_extra = {
            "example": {
                "username": "john_cricket",
                "email": "john@example.com",
                "password": "secure_password",
                "interests": ["cricket", "football"],
            }
        }

class LoginRequest(BaseModel):
    email: EmailStr
    password: str
    
    class Config:
        json_schema_extra = {
            "example": {
                "email": "john@example.com",
                "password": "secure_password",
            }
        }

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user_id: str

# ============ USER SCHEMAS ============
class UserProfile(BaseModel):
    id: Optional[str] = None
    username: str
    email: EmailStr
    bio: Optional[str] = None
    profile_picture: Optional[str] = None
    interests: List[str] = []
    followers_count: int = 0
    following_count: int = 0
    posts_count: int = 0
    created_at: datetime
    
    class Config:
        json_schema_extra = {
            "example": {
                "username": "john_cricket",
                "email": "john@example.com",
                "bio": "Cricket lover",
                "interests": ["cricket"],
                "followers_count": 125,
                "following_count": 50,
            }
        }

class UpdateProfileRequest(BaseModel):
    username: Optional[str] = None
    bio: Optional[str] = None
    interests: Optional[List[str]] = None
    profile_picture: Optional[str] = None

# ============ POST SCHEMAS ============
class CreatePostRequest(BaseModel):
    caption: str
    image_url: Optional[str] = None
    video_url: Optional[str] = None
    tags: List[str] = []
    hashtags: List[str] = []
    ai_generated: bool = False
    
    class Config:
        json_schema_extra = {
            "example": {
                "caption": "Amazing cricket match!",
                "hashtags": ["cricket", "india"],
                "ai_generated": False,
            }
        }

class PostResponse(BaseModel):
    id: Optional[str] = None
    user_id: str
    caption: str
    image_url: Optional[str] = None
    video_url: Optional[str] = None
    tags: List[str] = []
    hashtags: List[str] = []
    likes_count: int = 0
    comments_count: int = 0
    created_at: datetime
    
    class Config:
        json_schema_extra = {
            "example": {
                "caption": "Amazing cricket match!",
                "likes_count": 150,
                "comments_count": 25,
            }
        }

class CommentRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=500)
    
    class Config:
        json_schema_extra = {
            "example": {
                "text": "Great shot!",
            }
        }

class CommentResponse(BaseModel):
    id: Optional[str] = None
    user_id: str
    username: str
    text: str
    likes_count: int = 0
    created_at: datetime

# ============ LEAGUE SCHEMAS ============
class LeagueResponse(BaseModel):
    id: Optional[str] = None
    name: str
    description: str
    sport: str
    logo_url: Optional[str] = None
    followers_count: int = 0
    posts_count: int = 0
    
    class Config:
        json_schema_extra = {
            "example": {
                "name": "IPL",
                "sport": "cricket",
                "followers_count": 50000,
            }
        }

# ============ MESSAGE SCHEMAS ============
class SendMessageRequest(BaseModel):
    sender_id: str
    receiver_id: str
    text: str
    image_url: Optional[str] = None

class MessageResponse(BaseModel):
    id: Optional[str] = None
    sender_id: str
    receiver_id: Optional[str] = None
    text: str
    created_at: datetime
    is_read: bool = False

# ============ NOTIFICATION SCHEMAS ============
class NotificationCreateRequest(BaseModel):
    user_id: str
    notif_type: str
    actor_id: str
    message: str
    post_id: Optional[str] = None

class NotificationResponse(BaseModel):
    id: Optional[str] = None
    type: str
    actor_id: str
    message: str
    is_read: bool = False
    created_at: datetime

# ============ AI SCHEMAS ============
class AIGenerateCaptionRequest(BaseModel):
    sport: str
    context: Optional[str] = None
    
    class Config:
        json_schema_extra = {
            "example": {
                "sport": "cricket",
                "context": "Just won the match",
            }
        }

class AIGenerateHashtagsRequest(BaseModel):
    caption: str
    sport: Optional[str] = None
    
    class Config:
        json_schema_extra = {
            "example": {
                "caption": "Amazing cricket match!",
                "sport": "cricket",
            }
        }

class AIGenerateImageRequest(BaseModel):
    prompt: str
    sport: Optional[str] = None
    
    class Config:
        json_schema_extra = {
            "example": {
                "prompt": "A cricket player hitting a six",
                "sport": "cricket",
            }
        }

class AIResponse(BaseModel):
    success: bool
    data: str
    error: Optional[str] = None
