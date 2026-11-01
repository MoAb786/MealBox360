"""
seed_demo_data.py — Load Indian starter recipes and seed ingredient catalogue into MongoDB.

Usage:
    cd backend
    source .venv/bin/activate
    python scripts/seed_demo_data.py
"""
import asyncio
import json
import sys
from pathlib import Path
from datetime import datetime, timezone

# Allow running from scripts/ or backend/
sys.path.insert(0, str(Path(__file__).parent.parent))

from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings
from app.services.normalizer import normalize, ALIAS_MAP


DATA_FILE = Path(__file__).parent.parent / "data" / "seeds" / "indian_starter_recipes.json"


async def main():
    print("🌱 MealBox360 Demo Seed Script")
    print(f"   Connecting to: {settings.mongodb_uri[:40]}...")

    client = AsyncIOMotorClient(settings.mongodb_uri)
    db = client[settings.mongodb_database]

    # -----------------------------------------------------------------------
    # 1. Load recipe data
    # -----------------------------------------------------------------------
    with open(DATA_FILE) as f:
        recipes = json.load(f)
    print(f"\n📖 Loaded {len(recipes)} starter recipes from {DATA_FILE.name}")

    # -----------------------------------------------------------------------
    # 2. Build canonical ingredient catalogue from all recipes
    # -----------------------------------------------------------------------
    ingredient_set: dict[str, dict] = {}
    for recipe in recipes:
        for ing in recipe.get("ingredients_detail", []):
            raw_name = ing.get("name", "")
            canon = normalize(raw_name)
            if canon not in ingredient_set:
                ingredient_set[canon] = {
                    "canonical_name": canon,
                    "normalized_key": canon,
                    "aliases": [],
                    "category": _guess_category(canon),
                    "is_common_pantry_staple": canon in {"salt", "water", "cooking oil"},
                }
            # Collect alias if raw name differs from canonical
            raw_lower = raw_name.strip().lower()
            if raw_lower != canon and raw_lower not in ingredient_set[canon]["aliases"]:
                ingredient_set[canon]["aliases"].append(raw_lower)

    # Also add entries from the alias map for better coverage
    for alias, canon in ALIAS_MAP.items():
        if canon not in ingredient_set:
            ingredient_set[canon] = {
                "canonical_name": canon,
                "normalized_key": canon,
                "aliases": [],
                "category": _guess_category(canon),
                "is_common_pantry_staple": canon in {"salt", "water", "cooking oil"},
            }
        if alias != canon and alias not in ingredient_set[canon]["aliases"]:
            ingredient_set[canon]["aliases"].append(alias)

    # Upsert ingredients
    ing_count = 0
    for canon, doc in ingredient_set.items():
        await db.ingredients.update_one(
            {"normalized_key": canon},
            {"$setOnInsert": {**doc, "created_at": datetime.now(timezone.utc)}},
            upsert=True,
        )
        ing_count += 1
    print(f"✅ Upserted {ing_count} canonical ingredients into 'ingredients' collection")

    # -----------------------------------------------------------------------
    # 3. Upsert recipes with normalized ingredient IDs
    # -----------------------------------------------------------------------
    recipe_count = 0
    for recipe in recipes:
        # Resolve normalized_ingredient_ids
        normalized_ids = []
        for ing in recipe.get("ingredients_detail", []):
            canon = normalize(ing.get("name", ""))
            ing_doc = await db.ingredients.find_one({"normalized_key": canon})
            if ing_doc:
                normalized_ids.append(ing_doc["_id"])

        recipe_doc = {
            **recipe,
            "normalized_ingredient_ids": normalized_ids,
            "created_at": datetime.now(timezone.utc),
        }
        await db.recipes.update_one(
            {"external_source": recipe["external_source"], "external_id": recipe["external_id"]},
            {"$setOnInsert": recipe_doc},
            upsert=True,
        )
        recipe_count += 1

    print(f"✅ Upserted {recipe_count} recipes into 'recipes' collection")

    # -----------------------------------------------------------------------
    # 4. Seed demo users
    # -----------------------------------------------------------------------
    from app.core.security import hash_password

    demo_emails = ["demo@mealbox360.com", "demo@mealbox360.local"]
    for demo_email in demo_emails:
        existing_demo = await db.users.find_one({"email": demo_email})
        if existing_demo:
            print(f"👤 Demo user '{demo_email}' already exists")
        else:
            now = datetime.now(timezone.utc)
            result = await db.users.insert_one({
                "email": demo_email,
                "password_hash": hash_password("demo1234"),
                "display_name": "Demo User",
                "created_at": now,
                "is_active": True,
            })
            await db.user_preferences.insert_one({
                "user_id": result.inserted_id,
                "diet_type": "vegetarian",
                "allergies": [],
                "disliked_ingredients": [],
                "preferred_cuisines": ["Indian"],
                "max_cooking_minutes": 30,
                "budget_per_serving_inr": None,
                "cooking_skill": "beginner",
                "servings_default": 1,
                "updated_at": now,
            })
            print(f"👤 Created demo user: {demo_email} / demo1234")

    # -----------------------------------------------------------------------
    # 5. Ensure indexes
    # -----------------------------------------------------------------------
    import pymongo
    await db.users.create_index("email", unique=True)
    await db.user_preferences.create_index("user_id", unique=True)
    await db.ingredients.create_index("normalized_key", unique=True)
    await db.pantry_items.create_index("user_id")
    await db.pantry_items.create_index([("user_id", pymongo.ASCENDING), ("canonical_name", pymongo.ASCENDING)])
    await db.pantry_items.create_index("expiry_date")
    await db.recipes.create_index(
        [("external_source", pymongo.ASCENDING), ("external_id", pymongo.ASCENDING)], unique=True
    )
    await db.recipes.create_index([("title", pymongo.TEXT)])
    await db.meal_history.create_index([("user_id", pymongo.ASCENDING), ("cooked_at", pymongo.DESCENDING)])
    await db.favourites.create_index(
        [("user_id", pymongo.ASCENDING), ("recipe_id", pymongo.ASCENDING)], unique=True
    )
    print("✅ Indexes ensured")

    client.close()
    print("\n🎉 Seeding complete!")
    print(f"   Recipes:     {recipe_count}")
    print(f"   Ingredients: {ing_count}")
    print(f"   Demo login:  demo@mealbox360.local / demo1234")


def _guess_category(canonical: str) -> str:
    grains = {"rice", "basmati rice", "poha", "oats", "wheat flour", "all-purpose flour", "bread"}
    proteins = {"egg", "paneer", "red lentils", "yellow lentils", "moong dal", "chana dal", "urad dal", "chickpeas"}
    vegetables = {"onion", "tomato", "potato", "carrot", "capsicum", "spinach", "green peas", "cauliflower",
                  "cabbage", "spring onion", "shallot", "red capsicum", "yellow capsicum"}
    dairy = {"milk", "curd", "butter", "ghee", "cream"}
    spices = {"salt", "cumin seeds", "mustard seeds", "turmeric powder", "red chilli powder", "green chilli",
              "red chilli", "garam masala", "coriander powder", "coriander leaves", "curry leaves",
              "asafoetida", "garlic", "ginger", "lemon", "lemon juice", "cumin powder"}
    oils = {"cooking oil", "mustard oil", "olive oil"}
    flour = {"chickpea flour", "wheat flour", "all-purpose flour"}

    if canonical in grains:
        return "grains"
    if canonical in proteins:
        return "protein"
    if canonical in vegetables:
        return "vegetable"
    if canonical in dairy:
        return "dairy"
    if canonical in spices:
        return "spice"
    if canonical in oils:
        return "oil"
    if canonical in flour:
        return "flour"
    return "other"


if __name__ == "__main__":
    asyncio.run(main())
