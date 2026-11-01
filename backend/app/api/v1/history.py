from fastapi import APIRouter, Depends, HTTPException, Query
from bson import ObjectId
from datetime import datetime, timezone

from app.db.client import get_db
from app.core.security import get_current_user_id
from app.schemas.recipes import MealHistoryIn, MealHistoryUpdate, MealHistoryOut

router = APIRouter()


def _history_out(doc: dict) -> MealHistoryOut:
    return MealHistoryOut(
        id=str(doc["_id"]),
        user_id=str(doc["user_id"]),
        recipe_id=str(doc["recipe_id"]),
        recipe_title_snapshot=doc.get("recipe_title_snapshot", ""),
        cooked_at=doc["cooked_at"],
        servings=doc.get("servings", 1),
        rating=doc.get("rating"),
        notes=doc.get("notes"),
        ingredients_used=doc.get("ingredients_used", []),
    )


@router.post("/history", response_model=MealHistoryOut, status_code=201)
async def mark_cooked(body: MealHistoryIn, user_id: str = Depends(get_current_user_id)):
    db = get_db()
    try:
        rid = ObjectId(body.recipe_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid recipe ID")

    recipe = await db.recipes.find_one({"_id": rid})
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")

    now = datetime.now(timezone.utc)
    doc = {
        "user_id": ObjectId(user_id),
        "recipe_id": rid,
        "recipe_title_snapshot": recipe.get("title", ""),
        "cooked_at": body.cooked_at or now,
        "servings": body.servings,
        "rating": body.rating,
        "notes": body.notes,
        "ingredients_used": recipe.get("ingredient_names", []),
        "quantity_aware": recipe.get("quantity_aware", False),
    }
    result = await db.meal_history.insert_one(doc)
    doc["_id"] = result.inserted_id
    return _history_out(doc)


@router.get("/history", response_model=list[MealHistoryOut])
async def get_history(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    user_id: str = Depends(get_current_user_id),
):
    db = get_db()
    cursor = db.meal_history.find(
        {"user_id": ObjectId(user_id)}
    ).sort("cooked_at", -1).skip(skip).limit(limit)
    docs = await cursor.to_list(length=limit)
    return [_history_out(d) for d in docs]


@router.get("/history/summary")
async def get_history_summary(user_id: str = Depends(get_current_user_id)):
    db = get_db()
    total = await db.meal_history.count_documents({"user_id": ObjectId(user_id)})
    pipeline = [
        {"$match": {"user_id": ObjectId(user_id)}},
        {"$group": {"_id": "$recipe_id", "count": {"$sum": 1}, "title": {"$first": "$recipe_title_snapshot"}}},
        {"$sort": {"count": -1}},
        {"$limit": 5},
    ]
    most_cooked = await db.meal_history.aggregate(pipeline).to_list(length=5)
    return {
        "total_meals_cooked": total,
        "most_cooked_recipes": [
            {"recipe_id": str(r["_id"]), "title": r["title"], "times_cooked": r["count"]}
            for r in most_cooked
        ],
    }


@router.patch("/history/{entry_id}", response_model=MealHistoryOut)
async def update_history(
    entry_id: str,
    body: MealHistoryUpdate,
    user_id: str = Depends(get_current_user_id),
):
    db = get_db()
    try:
        oid = ObjectId(entry_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid entry ID")

    update_data = body.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(status_code=400, detail="Nothing to update")
    if "rating" in update_data and update_data["rating"] is not None:
        if not (1 <= update_data["rating"] <= 5):
            raise HTTPException(status_code=400, detail="Rating must be 1–5")

    doc = await db.meal_history.find_one_and_update(
        {"_id": oid, "user_id": ObjectId(user_id)},
        {"$set": update_data},
        return_document=True,
    )
    if not doc:
        raise HTTPException(status_code=404, detail="History entry not found")
    return _history_out(doc)


@router.delete("/history/{entry_id}", status_code=204)
async def delete_history(entry_id: str, user_id: str = Depends(get_current_user_id)):
    db = get_db()
    try:
        oid = ObjectId(entry_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid entry ID")
    result = await db.meal_history.delete_one({"_id": oid, "user_id": ObjectId(user_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="History entry not found")
