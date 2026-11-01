from fastapi import APIRouter, Depends, HTTPException, Query
from bson import ObjectId
from datetime import datetime, timezone

from app.db.client import get_db
from app.core.security import get_current_user_id
from app.schemas.recipes import RecommendationResponse, RecommendationItem, RecipeOut, IngredientDetail, NutritionInfo
from app.services.recommender import rank_recommendations
from app.services.normalizer import normalize

router = APIRouter()


def _nutrition_out(n: dict | None) -> NutritionInfo | None:
    if not n or n.get("calories_kcal") is None:
        return None
    return NutritionInfo(**{k: v for k, v in n.items() if k in NutritionInfo.model_fields})


def _recipe_doc_to_out(doc: dict, pantry_canonical: set[str] | None = None) -> RecipeOut:
    ingredients_detail = []
    for ing in doc.get("ingredients_detail", []):
        canon = normalize(ing.get("name", ""))
        available = None
        if pantry_canonical is not None:
            available = canon in pantry_canonical
        ingredients_detail.append(IngredientDetail(
            name=ing.get("name", ""),
            canonical_name=canon,
            quantity=ing.get("quantity"),
            unit=ing.get("unit"),
            required=ing.get("required", True),
            available=available,
        ))

    nutrition = _nutrition_out(doc.get("nutrition_per_serving"))

    return RecipeOut(
        id=str(doc["_id"]),
        title=doc.get("title", ""),
        description=doc.get("description"),
        cuisine=doc.get("cuisine"),
        diet_tags=doc.get("diet_tags", []),
        allergen_tags=doc.get("allergen_tags", []),
        difficulty=doc.get("difficulty"),
        total_time_minutes=doc.get("total_time_minutes"),
        prep_minutes=doc.get("prep_minutes"),
        cook_minutes=doc.get("cook_minutes"),
        servings=doc.get("servings"),
        ingredient_names=doc.get("ingredient_names", []),
        ingredients_detail=ingredients_detail,
        steps=doc.get("steps", []),
        nutrition_per_serving=nutrition,
        image_url=doc.get("image_url"),
        source_url=doc.get("source_url"),
        attribution=doc.get("attribution"),
        average_rating=doc.get("average_rating"),
        rating_count=doc.get("rating_count", 0),
        quantity_aware=doc.get("quantity_aware", False),
    )


async def _get_user_pantry_and_prefs(user_id: str, db):
    pantry_items = await db.pantry_items.find({"user_id": ObjectId(user_id)}).to_list(length=500)
    prefs_doc = await db.user_preferences.find_one({"user_id": ObjectId(user_id)})
    user_prefs = prefs_doc if prefs_doc else {}
    return pantry_items, user_prefs


@router.get("/recommendations", response_model=RecommendationResponse)
async def get_recommendations(
    mode: str = Query("cook_now", pattern="^(cook_now|almost_there)$"),
    max_time: int = Query(None, ge=1),
    cuisine: str = Query(None),
    diet: str = Query(None),
    limit: int = Query(50, ge=1, le=100),
    user_id: str = Depends(get_current_user_id),
):
    db = get_db()
    pantry_items, user_prefs = await _get_user_pantry_and_prefs(user_id, db)

    if not pantry_items:
        return RecommendationResponse(mode=mode, items=[], total=0)

    # Apply optional filter overrides from query params
    effective_prefs = dict(user_prefs)
    if max_time:
        effective_prefs["max_cooking_minutes"] = max_time
    if diet:
        effective_prefs["diet_type"] = diet

    # Build recipe query (server-side pre-filter for cuisine)
    recipe_query: dict = {}
    if cuisine:
        recipe_query["cuisine"] = {"$regex": cuisine, "$options": "i"}

    recipes = await db.recipes.find(recipe_query).to_list(length=5000)
    ranked = rank_recommendations(recipes, pantry_items, effective_prefs, mode)

    items = []
    for r in ranked[:limit]:
        items.append(RecommendationItem(
            recipe_id=r["recipe_id"],
            title=r["title"],
            cuisine=r["cuisine"],
            diet_tags=r["diet_tags"],
            match_percent=r["match_percent"],
            matched_count=r["matched_count"],
            required_count=r["required_count"],
            missing_ingredients=r["missing_ingredients"],
            total_time_minutes=r["total_time_minutes"],
            difficulty=r["difficulty"],
            recommendation_reasons=r["recommendation_reasons"],
            nutrition=_nutrition_out(r["nutrition"]) if r["nutrition"] else None,
            image_url=r["image_url"],
            source_url=r["source_url"],
            average_rating=r["average_rating"],
            score=r["score"],
        ))

    return RecommendationResponse(mode=mode, items=items, total=len(items))


@router.get("/search")
async def search_recipes(
    q: str = Query(..., min_length=1),
    limit: int = Query(20, ge=1, le=50),
    user_id: str = Depends(get_current_user_id),
):
    db = get_db()
    results = await db.recipes.find(
        {"$text": {"$search": q}},
        {"score": {"$meta": "textScore"}},
    ).sort([("score", {"$meta": "textScore"})]).limit(limit).to_list(length=limit)

    if not results:
        results = await db.recipes.find(
            {"title": {"$regex": q, "$options": "i"}}
        ).limit(limit).to_list(length=limit)

    return {"results": [_recipe_doc_to_out(r) for r in results], "total": len(results)}


@router.get("/categories")
async def get_categories(user_id: str = Depends(get_current_user_id)):
    db = get_db()
    cuisines = await db.recipes.distinct("cuisine")
    diet_tags = await db.recipes.distinct("diet_tags")
    return {
        "cuisines": sorted([c for c in cuisines if c]),
        "diet_tags": sorted([d for d in diet_tags if d]),
    }


@router.get("/favourites", response_model=list[RecipeOut])
async def get_favourites(user_id: str = Depends(get_current_user_id)):
    db = get_db()
    favs = await db.favourites.find({"user_id": ObjectId(user_id)}).to_list(length=200)
    recipe_ids = [f["recipe_id"] for f in favs]
    if not recipe_ids:
        return []
    recipes = await db.recipes.find({"_id": {"$in": recipe_ids}}).to_list(length=200)
    return [_recipe_doc_to_out(r) for r in recipes]


@router.post("/{recipe_id}/favourite", status_code=201)
async def add_favourite(recipe_id: str, user_id: str = Depends(get_current_user_id)):
    db = get_db()
    try:
        rid = ObjectId(recipe_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid recipe ID")
    recipe = await db.recipes.find_one({"_id": rid})
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")
    await db.favourites.update_one(
        {"user_id": ObjectId(user_id), "recipe_id": rid},
        {"$setOnInsert": {"saved_at": datetime.now(timezone.utc)}},
        upsert=True,
    )
    return {"message": "Recipe saved to favourites"}


@router.delete("/{recipe_id}/favourite", status_code=204)
async def remove_favourite(recipe_id: str, user_id: str = Depends(get_current_user_id)):
    db = get_db()
    try:
        rid = ObjectId(recipe_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid recipe ID")
    result = await db.favourites.delete_one({"user_id": ObjectId(user_id), "recipe_id": rid})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Favourite not found")


@router.get("/ingredients/search")
async def search_ingredients(q: str = Query(..., min_length=1), user_id: str = Depends(get_current_user_id)):
    db = get_db()
    results = await db.ingredients.find(
        {"$or": [
            {"canonical_name": {"$regex": q, "$options": "i"}},
            {"aliases": {"$elemMatch": {"$regex": q, "$options": "i"}}},
        ]}
    ).limit(20).to_list(length=20)
    return {"results": [
        {"canonical_name": r["canonical_name"], "aliases": r.get("aliases", []), "category": r.get("category")}
        for r in results
    ]}


@router.get("/{recipe_id}", response_model=RecipeOut)
async def get_recipe(recipe_id: str, user_id: str = Depends(get_current_user_id)):
    db = get_db()
    try:
        rid = ObjectId(recipe_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid recipe ID")
    recipe = await db.recipes.find_one({"_id": rid})
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")

    pantry_items = await db.pantry_items.find({"user_id": ObjectId(user_id)}).to_list(length=500)
    from app.services.normalizer import normalize
    pantry_canonical = {normalize(i.get("display_name", "")) for i in pantry_items}

    return _recipe_doc_to_out(recipe, pantry_canonical=pantry_canonical)
