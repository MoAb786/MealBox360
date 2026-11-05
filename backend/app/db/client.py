from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from app.core.config import settings
from typing import Optional
import asyncio

_client: Optional[AsyncIOMotorClient] = None
_db: Optional[AsyncIOMotorDatabase] = None


async def connect_db() -> None:
    global _client, _db
    try:
        import certifi
        tls_kwargs = {"tlsCAFile": certifi.where()}
    except Exception:
        tls_kwargs = {}

    _client = AsyncIOMotorClient(settings.mongodb_uri, **tls_kwargs)
    _db = _client[settings.mongodb_database]
    try:
        await asyncio.wait_for(_client.admin.command("ping"), timeout=4.0)
        print(f"✅ Connected to MongoDB: {settings.mongodb_database}")
    except Exception as e:
        print(f"⚠️ Warning: Could not ping MongoDB during startup ({e}). If using MongoDB Atlas, ensure your current IP is whitelisted under Atlas Network Access.")


async def close_db() -> None:
    global _client
    if _client:
        _client.close()
        print("🔌 MongoDB connection closed")


def get_db() -> AsyncIOMotorDatabase:
    if _db is None:
        raise RuntimeError("Database not connected. Call connect_db() first.")
    return _db
