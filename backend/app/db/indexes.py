from app.db.client import get_db
import pymongo


async def ensure_indexes() -> None:
    db = get_db()

    # users
    await db.users.create_index("email", unique=True)

    # user_preferences
    await db.user_preferences.create_index("user_id", unique=True)

    # ingredients catalogue
    await db.ingredients.create_index("normalized_key", unique=True)
    await db.ingredients.create_index("aliases")

    # pantry_items
    await db.pantry_items.create_index("user_id")
    await db.pantry_items.create_index([("user_id", pymongo.ASCENDING), ("ingredient_id", pymongo.ASCENDING)])
    await db.pantry_items.create_index("expiry_date")

    # recipes
    await db.recipes.create_index(
        [("external_source", pymongo.ASCENDING), ("external_id", pymongo.ASCENDING)],
        unique=True,
    )
    await db.recipes.create_index("normalized_ingredient_ids")
    await db.recipes.create_index("category")
    await db.recipes.create_index("total_time_minutes")
    await db.recipes.create_index([("title", pymongo.TEXT)])

    # meal_history
    await db.meal_history.create_index([("user_id", pymongo.ASCENDING), ("cooked_at", pymongo.DESCENDING)])

    # favourites
    await db.favourites.create_index(
        [("user_id", pymongo.ASCENDING), ("recipe_id", pymongo.ASCENDING)], unique=True
    )

    # nutrition cache
    await db.ingredient_nutrition_cache.create_index("canonical_name", unique=True)

    print("✅ MongoDB indexes ensured")
