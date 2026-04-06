from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, EmailStr

class User(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    password_hash: str
    profile_picture: Optional[str] = None
    bio: Optional[str] = None
    interests: List[str] = []  # e.g., ["cricket", "football", "basketball"]
    followers: List[str] = []  # User IDs
    following: List[str] = []  # User IDs
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    is_verified: bool = False
    is_active: bool = True
    
    class Config:
        json_schema_extra = {
            "example": {
                "username": "john_cricket",
                "email": "john@example.com",
                "bio": "Cricket enthusiast",
                "interests": ["cricket", "fitness"],
            }
        }

class Post(BaseModel):
    user_id: str
    caption: str
    image_url: Optional[str] = None
    video_url: Optional[str] = None
    tags: List[str] = []  # e.g., ["#cricket", "#india"]
    hashtags: List[str] = []  # e.g., ["cricket", "india"]
    likes: List[str] = []  # User IDs who liked
    comments: List[dict] = []  # List of comment objects
    shares: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    ai_generated: bool = False
    
    class Config:
        json_schema_extra = {
            "example": {
                "user_id": "user_123",
                "caption": "Amazing cricket match!",
                "tags": ["#cricket", "#ind"],
                "hashtags": ["cricket", "india"],
                "ai_generated": True,
            }
        }

class League(BaseModel):
    name: str  # e.g., "IPL", "Premier League"
    description: str
    sport: str  # e.g., "cricket", "football"
    logo_url: Optional[str] = None
    followers: List[str] = []  # User IDs
    posts: List[str] = []  # Post IDs
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        json_schema_extra = {
            "example": {
                "name": "IPL",
                "description": "Indian Premier League",
                "sport": "cricket",
            }
        }

class Comment(BaseModel):
    user_id: str
    post_id: str
    text: str
    likes: List[str] = []  # User IDs who liked this comment
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        json_schema_extra = {
            "example": {
                "user_id": "user_123",
                "post_id": "post_456",
                "text": "Great shot!",
            }
        }

class Message(BaseModel):
    sender_id: str
    receiver_id: Optional[str] = None  # None for group messages
    chat_id: str  # Group chat ID or conversation ID
    text: str
    image_url: Optional[str] = None
    is_read: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        json_schema_extra = {
            "example": {
                "sender_id": "user_123",
                "receiver_id": "user_456",
                "text": "Hey, how are you?",
            }
        }

class Notification(BaseModel):
    user_id: str
    type: str  # "like", "comment", "follow", "message"
    actor_id: str  # User who triggered the notification
    post_id: Optional[str] = None
    message: str
    is_read: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        json_schema_extra = {
            "example": {
                "user_id": "user_123",
                "type": "like",
                "actor_id": "user_456",
                "post_id": "post_789",
                "message": "user_456 liked your post",
            }
        }

class Recommendation(BaseModel):
    user_id: str
    post_ids: List[str] = []  # Recommended post IDs
    score: float  # Recommendation score
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        json_schema_extra = {
            "example": {
                "user_id": "user_123",
                "post_ids": ["post_1", "post_2", "post_3"],
                "score": 0.85,
            }
        }
