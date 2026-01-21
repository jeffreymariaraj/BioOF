import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base
from motor.motor_asyncio import AsyncIOMotorClient

# PostgreSQL Configuration
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://biouser:biopassword@localhost:5432/bioof_db")
# Convert to async driver schema if needed, but usually passed as postgresql+asyncpg://
# Here we assume the env var might need adjustment or we adjust it here.
# For asyncpg we need `postgresql+asyncpg://` scheme. 
if DATABASE_URL.startswith("postgresql://"):
    ASYNC_DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)
else:
    ASYNC_DATABASE_URL = DATABASE_URL

engine = create_async_engine(ASYNC_DATABASE_URL, echo=True)
AsyncSessionLocal = sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)
Base = declarative_base()

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session

# MongoDB Configuration
MONGO_URI = os.getenv("MONGO_URI", "mongodb://mongoadmin:mongopassword@localhost:27017")
client = AsyncIOMotorClient(MONGO_URI)
mongo_db = client.bioof_nosql

async def get_mongo_db():
    return mongo_db

# Redis Configuration
import redis.asyncio as redis

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

async def get_redis():
    client = redis.from_url(REDIS_URL, encoding="utf-8", decode_responses=True)
    try:
        yield client
    finally:
        await client.close()
