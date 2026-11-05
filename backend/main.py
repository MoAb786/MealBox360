from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.db.client import connect_db, close_db
from app.db.indexes import ensure_indexes
from app.api.v1.router import api_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        await connect_db()
    except Exception as e:
        print(f"⚠️ Warning during connect_db: {e}")
    try:
        await ensure_indexes()
    except Exception as e:
        print(f"⚠️ Warning during ensure_indexes: {e}")
    yield
    await close_db()


app = FastAPI(
    title="MealBox360 API",
    description="Smart Pantry Management & Recipe Recommendation System",
    version="2.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list + ["*"],  # "*" fallback for Expo Go dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health():
    from app.db.client import get_db
    try:
        db = get_db()
        await db.command("ping")
        db_status = "connected"
    except Exception as e:
        db_status = f"error: {e}"
    return {"status": "ok", "database": db_status, "version": "2.0.0"}


# Mount all v1 routes
app.include_router(api_router, prefix="/api/v1")

# ---------------------------------------------------------------------------
# Legacy Phase 1 aliases — kept so existing Expo Go app still partially works
# while frontend is being upgraded (Stage 4). Remove after Stage 4.
# ---------------------------------------------------------------------------
@app.get("/pantry")
async def legacy_pantry():
    return {"pantry": [], "message": "⚠️ Deprecated. Use /api/v1/pantry with auth token."}


@app.post("/pantry/add")
async def legacy_add():
    return {"message": "⚠️ Deprecated. Use POST /api/v1/pantry with auth token."}


@app.get("/recommendations")
async def legacy_recommendations():
    return {"recommendations": [], "message": "⚠️ Deprecated. Use /api/v1/recipes/recommendations with auth token."}
