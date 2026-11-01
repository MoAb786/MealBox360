import pytest
from datetime import date, timedelta
from app.services.recommender import score_recipe, rank_recommendations
from app.services.normalizer import normalize

@pytest.fixture
def sample_recipe():
    return {
        "_id": "507f1f77bcf86cd799439011",
        "title": "Vegetable Pulao",
        "cuisine": "Indian",
        "diet_tags": ["vegetarian"],
        "allergen_tags": [],
        "total_time_minutes": 25,
        "difficulty": "easy",
        "ingredient_names": ["basmati rice", "green peas", "carrot", "onion", "cooking oil", "salt"],
        "ingredients_detail": [
            {"name": "basmati rice", "required": True},
            {"name": "green peas", "required": True},
            {"name": "carrot", "required": True},
            {"name": "onion", "required": True},
            {"name": "cooking oil", "required": True}, # Staple -> optional in scoring
            {"name": "salt", "required": True},        # Staple -> optional in scoring
        ],
        "nutrition_per_serving": None,
        "average_rating": 4.5,
        "quantity_aware": False,
    }

@pytest.fixture
def default_prefs():
    return {
        "diet_type": "no_preference",
        "allergies": [],
        "disliked_ingredients": [],
        "preferred_cuisines": [],
        "max_cooking_minutes": None,
    }

# 1. Pantry contains every required ingredient -> Cook Now, 100% match
def test_full_match_cook_now(sample_recipe, default_prefs):
    pantry = {"basmati rice", "green peas", "carrot", "onion"}
    scored = score_recipe(
        recipe=sample_recipe,
        pantry_canonical=pantry,
        expiring_canonical=set(),
        user_prefs=default_prefs,
    )
    assert scored is not None
    assert scored["category"] == "cook_now"
    assert scored["match_percent"] == 100
    assert scored["matched_count"] == 4
    assert len(scored["missing_ingredients"]) == 0

# 2. Pantry misses one ingredient -> Almost There, one missing item
def test_missing_one_almost_there(sample_recipe, default_prefs):
    pantry = {"basmati rice", "green peas", "carrot"}
    scored = score_recipe(
        recipe=sample_recipe,
        pantry_canonical=pantry,
        expiring_canonical=set(),
        user_prefs=default_prefs,
    )
    assert scored is not None
    assert scored["category"] == "almost_there"
    assert scored["matched_count"] == 3
    assert scored["missing_ingredients"] == ["onion"]

# 3. Pantry misses two ingredients -> Almost There, two missing items
def test_missing_two_almost_there(sample_recipe, default_prefs):
    pantry = {"basmati rice", "green peas"}
    scored = score_recipe(
        recipe=sample_recipe,
        pantry_canonical=pantry,
        expiring_canonical=set(),
        user_prefs=default_prefs,
    )
    assert scored is not None
    assert scored["category"] == "almost_there"
    assert scored["matched_count"] == 2
    assert set(scored["missing_ingredients"]) == {"carrot", "onion"}

# 4. Pantry misses three ingredients -> excluded from main recommendation lists
def test_missing_three_excluded(sample_recipe, default_prefs):
    pantry = {"basmati rice"}
    scored = score_recipe(
        recipe=sample_recipe,
        pantry_canonical=pantry,
        expiring_canonical=set(),
        user_prefs=default_prefs,
    )
    assert scored is None

# 5. Ingredient alias resolves correctly
def test_alias_resolution_in_scoring(default_prefs):
    recipe = {
        "_id": "507f1f77bcf86cd799439012",
        "title": "Capsicum Fry",
        "diet_tags": ["vegetarian"],
        "allergen_tags": [],
        "ingredients_detail": [
            {"name": "capsicum", "required": True},
            {"name": "onion", "required": True},
        ],
    }
    # User entered 'bell pepper' in pantry
    pantry = {normalize("bell pepper"), normalize("pyaz")}
    scored = score_recipe(
        recipe=recipe,
        pantry_canonical=pantry,
        expiring_canonical=set(),
        user_prefs=default_prefs,
    )
    assert scored is not None
    assert scored["category"] == "cook_now"
    assert scored["missing_ingredients"] == []

# 6. Optional pantry staple does not incorrectly block Cook Now
def test_staple_does_not_block_cook_now(sample_recipe, default_prefs):
    # User only has the 4 non-staple ingredients; lacks salt & cooking oil
    pantry = {"basmati rice", "green peas", "carrot", "onion"}
    scored = score_recipe(
        recipe=sample_recipe,
        pantry_canonical=pantry,
        expiring_canonical=set(),
        user_prefs=default_prefs,
    )
    assert scored is not None
    assert scored["category"] == "cook_now"

# 7. Allergy match excludes a recipe when source marks allergen
def test_allergen_exclusion(default_prefs):
    recipe = {
        "_id": "507f1f77bcf86cd799439013",
        "title": "Peanut Chutney",
        "diet_tags": ["vegetarian"],
        "allergen_tags": ["peanut"],
        "ingredients_detail": [{"name": "peanut", "required": True}],
    }
    prefs = dict(default_prefs, allergies=["peanut"])
    scored = score_recipe(
        recipe=recipe,
        pantry_canonical={"peanut"},
        expiring_canonical=set(),
        user_prefs=prefs,
    )
    assert scored is None

# 8. Unknown allergen data produces an uncertainty indicator
def test_unknown_allergen_status(sample_recipe, default_prefs):
    scored = score_recipe(
        recipe=sample_recipe,
        pantry_canonical={"basmati rice", "green peas", "carrot", "onion"},
        expiring_canonical=set(),
        user_prefs=default_prefs,
    )
    assert scored is not None
    assert scored["allergen_status"] == "unverified"

# 9. Expiring pantry ingredient increases the recipe's use-soon ranking
def test_expiry_boost_ranking(sample_recipe, default_prefs):
    recipe1 = dict(sample_recipe, _id="1", title="Recipe 1")
    recipe2 = {
        "_id": "2",
        "title": "Recipe 2",
        "cuisine": "Indian",
        "diet_tags": ["vegetarian"],
        "allergen_tags": [],
        "total_time_minutes": 25,
        "ingredients_detail": [
            {"name": "basmati rice", "required": True},
            {"name": "spinach", "required": True},
        ],
    }
    today = date.today()
    pantry_items = [
        {"display_name": "basmati rice"},
        {"display_name": "green peas"},
        {"display_name": "carrot"},
        {"display_name": "onion"},
        {"display_name": "spinach", "expiry_date": (today + timedelta(days=2)).isoformat()}, # expiring!
    ]
    ranked = rank_recommendations([recipe1, recipe2], pantry_items, default_prefs, mode="cook_now")
    # Recipe 2 uses spinach which is expiring soon -> should receive higher score boost
    assert len(ranked) == 2
    assert ranked[0]["recipe_id"] == "2"
    assert any("expire soon" in r for r in ranked[0]["recommendation_reasons"])

# 10. Unknown recipe time/nutrition remains null and is never displayed as zero or fabricated
def test_unknown_time_and_nutrition(default_prefs):
    recipe = {
        "_id": "3",
        "title": "Unknown Timings Dish",
        "diet_tags": ["vegetarian"],
        "allergen_tags": [],
        "total_time_minutes": None,
        "nutrition_per_serving": None,
        "ingredients_detail": [{"name": "rice", "required": True}],
    }
    scored = score_recipe(
        recipe=recipe,
        pantry_canonical={"rice"},
        expiring_canonical=set(),
        user_prefs=default_prefs,
    )
    assert scored is not None
    assert scored["total_time_minutes"] is None
    assert scored["nutrition"] is None
