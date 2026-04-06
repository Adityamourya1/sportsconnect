from .auth import router as auth_router
from .users import router as users_router
from .posts import router as posts_router
from .feed import router as feed_router
from .explore import router as explore_router
from .leagues import router as leagues_router
from .notifications import router as notifications_router
from .messages import router as messages_router
from .ai import router as ai_router
from .upload import router as upload_router
from .websocket import router as websocket_router
from .stories import stories_router

__all__ = [
    "auth_router",
    "users_router",
    "posts_router",
    "feed_router",
    "explore_router",
    "leagues_router",
    "notifications_router",
    "messages_router",
    "ai_router",
    "upload_router",
    "websocket_router",
    "stories_router",
]
