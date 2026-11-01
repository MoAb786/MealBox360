"""
USDA FoodData Central Nutrition Adapter
Uses /foods/search and caches results in MongoDB collection 'ingredient_nutrition_cache'
"""
from typing import Optional
import httpx
from datetime import datetime, timezone
from app.core.config import settings
from app.db.client import get_db

FDC_BASE_URL = "https://api.nal.usda.gov/fdc/v1"


async def lookup_ingredient_nutrition(query: str) -> Optional[dict]:
    """
    Search USDA FoodData Central for an ingredient.
    Checks local MongoDB cache first to avoid repeat external requests.
    """
    db = get_db()
    cache_key = query.strip().lower()

    # 1. Check local cache
    cached = await db.ingredient_nutrition_cache.find_one({"canonical_name": cache_key})
    if cached:
        return cached.get("nutrition")

    # If no API key configured, return None safely without breaking
    if not settings.usda_fdc_api_key:
        return None

    # 2. Call external API
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.get(
                f"{FDC_BASE_URL}/foods/search",
                params={
                    "api_key": settings.usda_fdc_api_key,
                    "query": query,
                    "pageSize": 1,
                    "dataType": ["Foundation", "SR Legacy"],
                },
            )
            if resp.status_code != 200:
                return None

            data = resp.json()
            foods = data.get("foods", [])
            if not foods:
                return None

            food = foods[0]
            nutrients = {n.get("nutrientName", "").lower(): n.get("value") for n in food.get("foodNutrients", [])}

            nutrition_data = {
                "calories_kcal": nutrients.get("energy"),
                "protein_g": nutrients.get("protein"),
                "carbohydrates_g": nutrients.get("carbohydrate, by difference"),
                "fat_g": nutrients.get("total lipid (fat)"),
                "source": "USDA FoodData Central",
                "is_estimate": True,
            }

            # Cache the result
            await db.ingredient_nutrition_cache.update_one(
                {"canonical_name": cache_key},
                {"$set": {"nutrition": nutrition_data, "cached_at": datetime.now(timezone.utc)}},
                upsert=True,
            )
            return nutrition_data
    except Exception as e:
        print(f"⚠️ USDA API lookup error: {e}")
        return None
