from fastapi import APIRouter, Depends, HTTPException
from bson import ObjectId
from datetime import datetime, timezone

from app.db.client import get_db
from app.core.security import get_current_user_id
from app.schemas.auth import UserPreferencesIn, UserPreferencesOut, UserOut

router = APIRouter()


@router.put("/profile", response_model=UserOut)
async def update_profile(body: dict, user_id: str = Depends(get_current_user_id)):
    db = get_db()
    allowed = {"display_name"}
    update_data = {k: v for k, v in body.items() if k in allowed}
    if not update_data:
        raise HTTPException(status_code=400, detail="No updatable fields provided")
    result = await db.users.find_one_and_update(
        {"_id": ObjectId(user_id)},
        {"$set": update_data},
        return_document=True,
    )
    if not result:
        raise HTTPException(status_code=404, detail="User not found")
    return UserOut(
        id=str(result["_id"]),
        email=result["email"],
        display_name=result["display_name"],
        created_at=result["created_at"],
        is_active=result.get("is_active", True),
    )


@router.get("/preferences", response_model=UserPreferencesOut)
async def get_preferences(user_id: str = Depends(get_current_user_id)):
    db = get_db()
    prefs = await db.user_preferences.find_one({"user_id": ObjectId(user_id)})
    if not prefs:
        raise HTTPException(status_code=404, detail="Preferences not found")
    prefs["user_id"] = str(prefs["user_id"])
    return UserPreferencesOut(**{k: v for k, v in prefs.items() if k != "_id"})


@router.put("/preferences", response_model=UserPreferencesOut)
async def update_preferences(body: UserPreferencesIn, user_id: str = Depends(get_current_user_id)):
    db = get_db()
    now = datetime.now(timezone.utc)
    update_doc = body.model_dump()
    update_doc["updated_at"] = now
    result = await db.user_preferences.find_one_and_update(
        {"user_id": ObjectId(user_id)},
        {"$set": update_doc},
        upsert=True,
        return_document=True,
    )
    result["user_id"] = str(result["user_id"])
    return UserPreferencesOut(**{k: v for k, v in result.items() if k != "_id"})
