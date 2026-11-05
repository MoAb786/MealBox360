from app.db.client import get_db
import pymongo
import asyncio


async def ensure_indexes() -> None:
    try:
        db = get_db()

        async def _create_all():
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

        await asyncio.wait_for(_create_all(), timeout=3.0)
    except Exception as e:
        print(f"⚠️ Notice: Index setup deferred ({e})")
