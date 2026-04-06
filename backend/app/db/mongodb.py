from motor.motor_asyncio import AsyncIOMotorClient
from app.config.settings import settings

class MongoDB:
    client: AsyncIOMotorClient = None
    db = None

db = MongoDB()

async def connect_to_mongo():
    """Create MongoDB connection pool"""
    db.client = AsyncIOMotorClient(
        settings.MONGO_URL,
        serverSelectionTimeoutMS=5000,
    )
    db.db = db.client[settings.DATABASE_NAME]
    print(f"✓ Connected to MongoDB: {settings.DATABASE_NAME}")

async def close_mongo_connection():
    """Close MongoDB connection"""
    if db.client:
        db.client.close()
        print("✓ Closed MongoDB connection")

def get_database():
    """Get database instance"""
    return db.db