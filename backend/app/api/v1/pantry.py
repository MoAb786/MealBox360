from fastapi import APIRouter, Depends, HTTPException, Query
from bson import ObjectId
from datetime import datetime, timezone, date

from app.db.client import get_db
from app.core.security import get_current_user_id
from app.schemas.pantry import PantryItemIn, PantryItemOut, PantryItemUpdate
from app.services.normalizer import normalize

router = APIRouter()

EXPIRY_SOON_DAYS = 7


def _expiry_status(expiry_date) -> str:
    if expiry_date is None:
        return "unknown"
    today = datetime.now(timezone.utc).date()
    if isinstance(expiry_date, datetime):
        expiry_date = expiry_date.date()
    if isinstance(expiry_date, str):
        try:
            expiry_date = date.fromisoformat(expiry_date)
        except ValueError:
            return "unknown"
    if expiry_date < today:
        return "expired"
    delta = (expiry_date - today).days
    return "use_soon" if delta <= EXPIRY_SOON_DAYS else "fresh"


def _doc_to_out(doc: dict) -> PantryItemOut:
    expiry = doc.get("expiry_date")
    if isinstance(expiry, datetime):
        expiry = expiry.date()
    return PantryItemOut(
        id=str(doc["_id"]),
        user_id=str(doc["user_id"]),
        ingredient_id=str(doc["ingredient_id"]) if doc.get("ingredient_id") else None,
        display_name=doc["display_name"],
        canonical_name=doc.get("canonical_name"),
        quantity=doc.get("quantity"),
        unit=doc.get("unit"),
        category=doc.get("category"),
        expiry_date=expiry,
        added_at=doc["added_at"],
        updated_at=doc["updated_at"],
        source=doc.get("source", "manual"),
        notes=doc.get("notes"),
        expiry_status=_expiry_status(expiry),
    )


@router.get("", response_model=list[PantryItemOut])
async def get_pantry(
    category: str = Query(None),
    user_id: str = Depends(get_current_user_id),
):
    db = get_db()
    query: dict = {"user_id": ObjectId(user_id)}
    if category:
        query["category"] = category
    cursor = db.pantry_items.find(query).sort("display_name", 1)
    docs = await cursor.to_list(length=500)
    return [_doc_to_out(d) for d in docs]


@router.post("", response_model=PantryItemOut, status_code=201)
async def add_pantry_item(body: PantryItemIn, user_id: str = Depends(get_current_user_id)):
    db = get_db()
    canonical = normalize(body.display_name)

    # Prevent duplicate canonical ingredient for this user
    existing = await db.pantry_items.find_one({
        "user_id": ObjectId(user_id),
        "canonical_name": canonical,
    })
    if existing:
        raise HTTPException(
            status_code=409,
            detail=f"'{canonical}' is already in your pantry. Use PATCH to update it.",
        )

    # Try to find canonical ingredient record
    ingredient_doc = await db.ingredients.find_one({"normalized_key": canonical})

    now = datetime.now(timezone.utc)
    expiry_val = None
    if body.expiry_date:
        expiry_val = datetime.combine(body.expiry_date, datetime.min.time()).replace(tzinfo=timezone.utc)

    doc = {
        "user_id": ObjectId(user_id),
        "ingredient_id": ingredient_doc["_id"] if ingredient_doc else None,
        "display_name": body.display_name,
        "canonical_name": canonical,
        "quantity": body.quantity,
        "unit": body.unit,
        "category": body.category or (ingredient_doc.get("category") if ingredient_doc else None),
        "expiry_date": expiry_val,
        "added_at": now,
        "updated_at": now,
        "source": body.source,
        "notes": body.notes,
    }
    result = await db.pantry_items.insert_one(doc)
    doc["_id"] = result.inserted_id
    return _doc_to_out(doc)


@router.patch("/{item_id}", response_model=PantryItemOut)
async def update_pantry_item(
    item_id: str,
    body: PantryItemUpdate,
    user_id: str = Depends(get_current_user_id),
):
    db = get_db()
    try:
        oid = ObjectId(item_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid item ID")

    existing = await db.pantry_items.find_one({"_id": oid, "user_id": ObjectId(user_id)})
    if not existing:
        raise HTTPException(status_code=404, detail="Pantry item not found")

    update: dict = {"updated_at": datetime.now(timezone.utc)}
    data = body.model_dump(exclude_unset=True)

    if "display_name" in data:
        update["display_name"] = data["display_name"]
        update["canonical_name"] = normalize(data["display_name"])
    if "quantity" in data:
        if data["quantity"] is not None and data["quantity"] <= 0:
            raise HTTPException(status_code=400, detail="Quantity must be positive")
        update["quantity"] = data["quantity"]
    if "unit" in data:
        update["unit"] = data["unit"]
    if "category" in data:
        update["category"] = data["category"]
    if "expiry_date" in data:
        if data["expiry_date"]:
            update["expiry_date"] = datetime.combine(data["expiry_date"], datetime.min.time()).replace(tzinfo=timezone.utc)
        else:
            update["expiry_date"] = None
    if "notes" in data:
        update["notes"] = data["notes"]

    doc = await db.pantry_items.find_one_and_update(
        {"_id": oid, "user_id": ObjectId(user_id)},
        {"$set": update},
        return_document=True,
    )
    return _doc_to_out(doc)


@router.delete("/{item_id}", status_code=204)
async def delete_pantry_item(item_id: str, user_id: str = Depends(get_current_user_id)):
    db = get_db()
    try:
        oid = ObjectId(item_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid item ID")
    result = await db.pantry_items.delete_one({"_id": oid, "user_id": ObjectId(user_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Pantry item not found")


@router.get("/expiring", response_model=list[PantryItemOut])
async def get_expiring_items(
    within_days: int = Query(7, ge=1, le=30),
    user_id: str = Depends(get_current_user_id),
):
    db = get_db()
    today = datetime.now(timezone.utc)
    from datetime import timedelta
    cutoff = today + timedelta(days=within_days)
    cursor = db.pantry_items.find({
        "user_id": ObjectId(user_id),
        "expiry_date": {"$ne": None, "$lte": cutoff},
    }).sort("expiry_date", 1)
    docs = await cursor.to_list(length=200)
    return [_doc_to_out(d) for d in docs]
