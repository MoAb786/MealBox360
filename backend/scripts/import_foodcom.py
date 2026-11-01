"""
import_foodcom.py — Import a curated subset of the Food.com Kaggle dataset into MongoDB.

LICENCE WARNING:
    The Food.com dataset files are "Data files © Original Authors".
    This importer is for academic/research use only.
    Do NOT commit the raw CSV files or redistribute the imported data.
    Check Kaggle licence terms before any public distribution.

Usage:
    cd backend
    source .venv/bin/activate
    python scripts/import_foodcom.py [--limit 8000] [--min-rating 3.0]

Prerequisites:
    Place these files in backend/data/raw/:
        - RAW_recipes.csv
        - RAW_interactions.csv
"""
import asyncio
import sys
import argparse
from pathlib import Path
from datetime import datetime, timezone

sys.path.insert(0, str(Path(__file__).parent.parent))

import pandas as pd
import ast
from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings
from app.services.normalizer import normalize

RAW_DIR = Path(__file__).parent.parent / "data" / "raw"
RECIPES_CSV = RAW_DIR / "RAW_recipes.csv"
INTERACTIONS_CSV = RAW_DIR / "RAW_interactions.csv"


def safe_literal_eval(val):
    if not isinstance(val, str):
        return []
    try:
        result = ast.literal_eval(val)
        return result if isinstance(result, list) else []
    except Exception:
        return []


def parse_nutrition(nutrition_str: str) -> dict:
    """
    Food.com nutrition array: [calories, total_fat_PDV, sugar_PDV, sodium_PDV, protein_PDV, sat_fat_PDV, carbs_PDV]
    Only calories is in kcal. All others are % daily value — do NOT label as grams.
    """
    vals = safe_literal_eval(nutrition_str)
    result = {
        "calories_kcal": None,
        "total_fat_pdv": None,
        "sugar_pdv": None,
        "sodium_pdv": None,
        "protein_pdv": None,
        "saturated_fat_pdv": None,
        "carbohydrates_pdv": None,
        "source": "Food.com (PDV = % daily value, not grams)",
        "is_estimate": True,
    }
    if len(vals) >= 1:
        try:
            result["calories_kcal"] = float(vals[0])
        except (TypeError, ValueError):
            pass
    if len(vals) >= 7:
        keys = ["total_fat_pdv", "sugar_pdv", "sodium_pdv", "protein_pdv", "saturated_fat_pdv", "carbohydrates_pdv"]
        for i, key in enumerate(keys):
            try:
                result[key] = float(vals[i + 1])
            except (TypeError, ValueError):
                pass
    return result


def guess_diet_tags(ingredients: list[str]) -> list[str]:
    """Conservative diet tagging — only tag 'vegan'/'vegetarian' when no animal products detected."""
    meat_keywords = {"chicken", "beef", "pork", "lamb", "mutton", "fish", "shrimp", "prawn", "bacon",
                     "turkey", "duck", "crab", "lobster", "anchovy", "tuna", "salmon", "sardine"}
    egg_keywords = {"egg", "eggs"}
    dairy_keywords = {"milk", "butter", "cheese", "cream", "yogurt", "curd", "ghee", "paneer"}

    ing_lower = {i.lower() for i in ingredients}
    has_meat = bool(ing_lower & meat_keywords)
    has_egg = bool(ing_lower & egg_keywords)
    has_dairy = bool(ing_lower & dairy_keywords)

    if not has_meat and not has_egg and not has_dairy:
        return ["vegetarian", "vegan"]
    if not has_meat and not has_egg:
        return ["vegetarian"]
    if not has_meat:
        return ["eggetarian"]
    return []  # non-veg — don't tag


async def main(limit: int, min_rating: float, min_steps: int, max_minutes: int):
    print("🍽️  Food.com Importer — MealBox360")
    print(f"   Limit: {limit} recipes | Min rating: {min_rating} | Max time: {max_minutes} min")
    print()

    if not RECIPES_CSV.exists():
        print(f"❌ Not found: {RECIPES_CSV}")
        print("   Download from: https://www.kaggle.com/datasets/shuyangli94/food-com-recipes-and-user-interactions")
        sys.exit(1)

    # -----------------------------------------------------------------------
    # 1. Load recipes
    # -----------------------------------------------------------------------
    print("📂 Loading RAW_recipes.csv ...")
    df_recipes = pd.read_csv(RECIPES_CSV, low_memory=False)
    rows_read = len(df_recipes)
    print(f"   Read {rows_read:,} rows")

    # -----------------------------------------------------------------------
    # 2. Load interactions and compute per-recipe aggregates
    # -----------------------------------------------------------------------
    avg_ratings = {}
    if INTERACTIONS_CSV.exists():
        print("📂 Loading RAW_interactions.csv ...")
        df_inter = pd.read_csv(INTERACTIONS_CSV, usecols=["recipe_id", "rating"], low_memory=False)
        print(f"   Read {len(df_inter):,} interaction rows")
        agg = df_inter.groupby("recipe_id")["rating"].agg(["mean", "count"]).reset_index()
        agg.columns = ["recipe_id", "avg_rating", "rating_count"]
        avg_ratings = {row["recipe_id"]: (row["avg_rating"], row["rating_count"]) for _, row in agg.iterrows()}
        print(f"   Aggregated ratings for {len(avg_ratings):,} recipes")
    else:
        print("⚠️  interactions file not found — importing without ratings")

    # -----------------------------------------------------------------------
    # 3. Filter and clean
    # -----------------------------------------------------------------------
    rows_rejected = 0
    recipes_to_import = []

    for _, row in df_recipes.iterrows():
        # Required fields
        if pd.isna(row.get("id")) or pd.isna(row.get("name")):
            rows_rejected += 1
            continue

        ingredients = safe_literal_eval(row.get("ingredients", "[]"))
        steps = safe_literal_eval(row.get("steps", "[]"))

        if not ingredients or not steps:
            rows_rejected += 1
            continue
        if len(steps) < min_steps:
            rows_rejected += 1
            continue

        # Time filter
        try:
            minutes = int(row.get("minutes", 0))
        except (ValueError, TypeError):
            minutes = 0
        if minutes > max_minutes or minutes <= 0:
            rows_rejected += 1
            continue

        recipe_id = int(row["id"])
        avg_rating, rating_count = avg_ratings.get(recipe_id, (None, 0))
        if min_rating > 0 and avg_rating is not None and avg_rating < min_rating:
            rows_rejected += 1
            continue

        # Parse tags
        tags = safe_literal_eval(row.get("tags", "[]"))
        diet_tags = guess_diet_tags(ingredients)

        # Nutrition
        nutrition = parse_nutrition(row.get("nutrition", "[]"))

        # Normalize ingredients
        ingredient_names = [str(i).strip() for i in ingredients if i]
        canonical_names = [normalize(n) for n in ingredient_names]

        ingredients_detail = [
            {"name": n, "quantity": None, "unit": None, "required": True}
            for n in ingredient_names
        ]

        recipe_doc = {
            "external_source": "foodcom",
            "external_id": str(recipe_id),
            "title": str(row.get("name", "")).strip().title(),
            "description": str(row.get("description", "")).strip() if pd.notna(row.get("description")) else None,
            "ingredient_names": ingredient_names,
            "ingredients_detail": ingredients_detail,
            "steps": [str(s).strip() for s in steps],
            "prep_minutes": None,
            "cook_minutes": None,
            "total_time_minutes": minutes if minutes > 0 else None,
            "servings": int(row["n_servings"]) if pd.notna(row.get("n_servings")) else None,
            "difficulty": "unknown",
            "cuisine": None,
            "diet_tags": diet_tags,
            "allergen_tags": [],
            "nutrition_per_serving": nutrition,
            "average_rating": round(float(avg_rating), 2) if avg_rating is not None else None,
            "rating_count": int(rating_count),
            "image_url": None,
            "source_url": f"https://www.food.com/recipe/{recipe_id}",
            "attribution": "Food.com (Shuyang Li et al., Kaggle dataset)",
            "quantity_aware": False,
            "created_at": datetime.now(timezone.utc),
        }
        recipes_to_import.append(recipe_doc)

        if len(recipes_to_import) >= limit:
            break

    print(f"\n📊 Filter results:")
    print(f"   Rows read:     {rows_read:,}")
    print(f"   Rows rejected: {rows_rejected:,}")
    print(f"   To import:     {len(recipes_to_import):,}")

    if not recipes_to_import:
        print("❌ No recipes to import after filtering.")
        return

    # -----------------------------------------------------------------------
    # 4. Upsert into MongoDB
    # -----------------------------------------------------------------------
    print("\n🚀 Connecting to MongoDB and importing ...")
    client = AsyncIOMotorClient(settings.mongodb_uri)
    db = client[settings.mongodb_database]

    imported = 0
    skipped = 0
    batch_size = 100

    for i in range(0, len(recipes_to_import), batch_size):
        batch = recipes_to_import[i:i + batch_size]
        for doc in batch:
            result = await db.recipes.update_one(
                {"external_source": doc["external_source"], "external_id": doc["external_id"]},
                {"$setOnInsert": doc},
                upsert=True,
            )
            if result.upserted_id:
                imported += 1
            else:
                skipped += 1
        if (i + batch_size) % 1000 < batch_size:
            print(f"   Progress: {i + len(batch):,} / {len(recipes_to_import):,}")

    # Estimate storage
    total_recipes = await db.recipes.count_documents({})
    client.close()

    print(f"\n✅ Import complete:")
    print(f"   New recipes inserted: {imported:,}")
    print(f"   Already existed (skipped): {skipped:,}")
    print(f"   Total recipes in collection: {total_recipes:,}")
    print(f"\n⚠️  Attribution: Food.com dataset — for academic use only.")
    print("   Do not redistribute. Check Kaggle licence before public deployment.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Import Food.com recipes into MealBox360 MongoDB")
    parser.add_argument("--limit", type=int, default=8000, help="Max recipes to import (default: 8000)")
    parser.add_argument("--min-rating", type=float, default=0.0, help="Minimum average rating (default: 0 = no filter)")
    parser.add_argument("--min-steps", type=int, default=2, help="Minimum recipe steps (default: 2)")
    parser.add_argument("--max-minutes", type=int, default=120, help="Maximum cooking time in minutes (default: 120)")
    args = parser.parse_args()

    asyncio.run(main(
        limit=args.limit,
        min_rating=args.min_rating,
        min_steps=args.min_steps,
        max_minutes=args.max_minutes,
    ))
