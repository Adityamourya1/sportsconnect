from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging

from app.config import settings
from app.db import connect_to_mongo, close_mongo_connection
from app.services.cache import RedisCache
from app.routes import (
    auth_router, users_router, posts_router, feed_router,
    explore_router, leagues_router, notifications_router,
    messages_router, ai_router, upload_router, websocket_router, stories_router
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="AI-Powered Sports Social Media Platform",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Startup event
@app.on_event("startup")
async def startup():
    """Initialize database connection and services on startup"""
    await connect_to_mongo()
    await RedisCache.connect()
    logger.info(f"✓ {settings.APP_NAME} started in {settings.ENVIRONMENT} mode")

# Shutdown event
@app.on_event("shutdown")
async def shutdown():
    """Close database connection and cache on shutdown"""
    await close_mongo_connection()
    await RedisCache.disconnect()
    logger.info(f"✓ {settings.APP_NAME} shutdown completed")

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT,
    }

# Root endpoint
@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": f"Welcome to {settings.APP_NAME}",
        "version": settings.APP_VERSION,
        "documentation": "/docs",
    }

# Include routers
app.include_router(auth_router)
app.include_router(users_router)
app.include_router(posts_router)
app.include_router(feed_router)
app.include_router(explore_router)
app.include_router(leagues_router)
app.include_router(notifications_router)
app.include_router(messages_router)
app.include_router(ai_router)
app.include_router(upload_router)
app.include_router(websocket_router)
app.include_router(stories_router)

# Error handlers
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Global exception handler"""
    logger.error(f"Unhandled exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"},
    )

if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG,
        log_level="info",
    )
