from fastapi import APIRouter, HTTPException, status, Depends
from datetime import datetime, timezone
from bson import ObjectId

from app.db.client import get_db
from app.core.security import hash_password, verify_password, create_access_token, get_current_user_id
from app.schemas.auth import UserRegister, UserLogin, TokenResponse, UserOut, UserPreferencesIn, UserPreferencesOut

router = APIRouter()


def _user_out(doc: dict) -> UserOut:
    return UserOut(
        id=str(doc["_id"]),
        email=doc["email"],
        display_name=doc["display_name"],
        created_at=doc["created_at"],
        is_active=doc.get("is_active", True),
    )


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(body: UserRegister):
    db = get_db()
    email_clean = body.email.strip().lower()
    existing = await db.users.find_one({"email": email_clean})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    now = datetime.now(timezone.utc)
    user_doc = {
        "email": email_clean,
        "password_hash": hash_password(body.password),
        "display_name": body.display_name.strip(),
        "created_at": now,
        "is_active": True,
    }
    result = await db.users.insert_one(user_doc)
    user_id = str(result.inserted_id)

    # Create default preferences
    await db.user_preferences.insert_one({
        "user_id": result.inserted_id,
        "diet_type": "no_preference",
        "allergies": [],
        "disliked_ingredients": [],
        "preferred_cuisines": [],
        "max_cooking_minutes": None,
        "budget_per_serving_inr": None,
        "cooking_skill": "beginner",
        "servings_default": 1,
        "updated_at": now,
    })

    token = create_access_token({"sub": user_id})
    return TokenResponse(access_token=token)


@router.post("/login", response_model=TokenResponse)
async def login(body: UserLogin):
    db = get_db()
    email_clean = body.email.strip().lower()
    user = await db.users.find_one({"email": email_clean})
    if not user or not verify_password(body.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    if not user.get("is_active", True):
        raise HTTPException(status_code=403, detail="Account disabled")

    token = create_access_token({"sub": str(user["_id"])})
    return TokenResponse(access_token=token)


@router.get("/me", response_model=UserOut)
async def me(user_id: str = Depends(get_current_user_id)):
    db = get_db()
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return _user_out(user)
