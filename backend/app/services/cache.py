import aioredis
from typing import Optional, Any, List
import json
import logging
from app.config import settings

logger = logging.getLogger(__name__)

class RedisCache:
    """Redis caching service for feed, users, and other data"""
    
    redis: Optional[aioredis.Redis] = None
    
    @classmethod
    async def connect(cls):
        """Initialize Redis connection"""
        try:
            cls.redis = await aioredis.from_url(
                "redis://localhost:6379",
                encoding="utf8",
                decode_responses=True
            )
            logger.info("✓ Connected to Redis cache")
        except Exception as e:
            logger.warning(f"Failed to connect to Redis: {e}. Caching disabled.")
            cls.redis = None
    
    @classmethod
    async def disconnect(cls):
        """Close Redis connection"""
        if cls.redis:
            await cls.redis.close()
            logger.info("✓ Disconnected from Redis")
    
    @classmethod
    async def get(cls, key: str) -> Optional[Any]:
        """Get value from cache"""
        if not cls.redis:
            return None
        
        try:
            value = await cls.redis.get(key)
            if value:
                logger.debug(f"✓ Cache hit: {key}")
                return json.loads(value)
            logger.debug(f"✗ Cache miss: {key}")
            return None
        except Exception as e:
            logger.error(f"Cache get error: {e}")
            return None
    
    @classmethod
    async def set(cls, key: str, value: Any, expire: int = 3600):
        """Set value in cache with TTL"""
        if not cls.redis:
            return False
        
        try:
            await cls.redis.setex(
                key,
                expire,
                json.dumps(value, default=str)
            )
            logger.debug(f"✓ Cache set: {key} (TTL: {expire}s)")
            return True
        except Exception as e:
            logger.error(f"Cache set error: {e}")
            return False
    
    @classmethod
    async def delete(cls, key: str):
        """Delete key from cache"""
        if not cls.redis:
            return False
        
        try:
            await cls.redis.delete(key)
            logger.debug(f"✓ Cache deleted: {key}")
            return True
        except Exception as e:
            logger.error(f"Cache delete error: {e}")
            return False
    
    @classmethod
    async def delete_pattern(cls, pattern: str):
        """Delete multiple keys matching pattern"""
        if not cls.redis:
            return False
        
        try:
            keys = await cls.redis.keys(pattern)
            if keys:
                await cls.redis.delete(*keys)
                logger.debug(f"✓ Cache deleted {len(keys)} keys matching {pattern}")
            return True
        except Exception as e:
            logger.error(f"Cache delete pattern error: {e}")
            return False
    
    @classmethod
    async def clear_all(cls):
        """Clear entire cache"""
        if not cls.redis:
            return False
        
        try:
            await cls.redis.flushdb()
            logger.info("✓ Cache cleared")
            return True
        except Exception as e:
            logger.error(f"Cache clear error: {e}")
            return False


# Cache key patterns
class CacheKeys:
    """Cache key definitions"""
    
    # Feed cache
    FEED_USER = "feed:user:{user_id}"  # Personalized feed
    FEED_TRENDING = "feed:trending"     # Trending posts
    
    # User cache
    USER_PROFILE = "user:profile:{user_id}"
    USER_POSTS = "user:posts:{user_id}"
    USER_FOLLOWERS = "user:followers:{user_id}"
    USER_FOLLOWING = "user:following:{user_id}"
    
    # Post cache
    POST_DATA = "post:{post_id}"
    POST_LIKES = "post:likes:{post_id}"
    POST_COMMENTS = "post:comments:{post_id}"
    
    # Search cache
    SEARCH_USERS = "search:users:{query}"
    SEARCH_POSTS = "search:posts:{query}"
    SEARCH_HASHTAGS = "search:hashtags:{query}"
    
    @staticmethod
    def feed_user(user_id: str) -> str:
        return CacheKeys.FEED_USER.format(user_id=user_id)
    
    @staticmethod
    def user_profile(user_id: str) -> str:
        return CacheKeys.USER_PROFILE.format(user_id=user_id)
    
    @staticmethod
    def user_posts(user_id: str) -> str:
        return CacheKeys.USER_POSTS.format(user_id=user_id)
    
    @staticmethod
    def post_data(post_id: str) -> str:
        return CacheKeys.POST_DATA.format(post_id=post_id)


class CacheService:
    """Service for managing cache operations"""
    
    # Cache TTL values (in seconds)
    FEED_TTL = 300           # 5 minutes
    USER_PROFILE_TTL = 600   # 10 minutes
    USER_POSTS_TTL = 300     # 5 minutes
    TRENDING_TTL = 600       # 10 minutes
    SEARCH_TTL = 1800        # 30 minutes
    
    @staticmethod
    async def get_user_feed(user_id: str):
        """Get cached user feed"""
        key = CacheKeys.feed_user(user_id)
        return await RedisCache.get(key)
    
    @staticmethod
    async def cache_user_feed(user_id: str, feed_data: List[dict]):
        """Cache user feed"""
        key = CacheKeys.feed_user(user_id)
        return await RedisCache.set(
            key,
            feed_data,
            expire=CacheService.FEED_TTL
        )
    
    @staticmethod
    async def get_user_profile(user_id: str):
        """Get cached user profile"""
        key = CacheKeys.user_profile(user_id)
        return await RedisCache.get(key)
    
    @staticmethod
    async def cache_user_profile(user_id: str, profile_data: dict):
        """Cache user profile"""
        key = CacheKeys.user_profile(user_id)
        return await RedisCache.set(
            key,
            profile_data,
            expire=CacheService.USER_PROFILE_TTL
        )
    
    @staticmethod
    async def invalidate_user_cache(user_id: str):
        """Invalidate all user-related cache"""
        patterns = [
            f"feed:user:{user_id}",
            f"user:profile:{user_id}",
            f"user:posts:{user_id}",
            f"user:followers:{user_id}",
            f"user:following:{user_id}",
        ]
        
        for pattern in patterns:
            await RedisCache.delete_pattern(pattern)
        
        logger.info(f"✓ Invalidated cache for user {user_id}")
    
    @staticmethod
    async def invalidate_post_cache(post_id: str):
        """Invalidate post-related cache"""
        patterns = [
            f"post:{post_id}",
            f"post:likes:{post_id}",
            f"post:comments:{post_id}",
        ]
        
        for pattern in patterns:
            await RedisCache.delete_pattern(pattern)
        
        # Also invalidate feed cache (since post changed)
        await RedisCache.delete_pattern("feed:*")
        logger.info(f"✓ Invalidated cache for post {post_id}")
    
    @staticmethod
    async def invalidate_feed_cache():
        """Invalidate all feed cache"""
        await RedisCache.delete_pattern("feed:*")
        logger.info("✓ Invalidated all feed cache")
