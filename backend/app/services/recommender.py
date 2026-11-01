"""
MealBox360 Recommendation Engine v2

Deterministic, explainable content-based recommender.
No LLM or paid AI dependency required.

Ranking weights (configurable):
  pantry_coverage   40%
  expiry_bonus      20%
  time_fit          15%
  preference_fit    15%
  nutrition_signal  10% (omitted and weights renormalized if data unavailable)
"""
from __future__ import annotations
from datetime import date, datetime, timezone
from typing import Optional

from app.services.normalizer import normalize, is_pantry_staple

# ---------------------------------------------------------------------------
# Configurable weights
# ---------------------------------------------------------------------------
WEIGHTS = {
    "pantry_coverage": 0.40,
    "expiry_bonus": 0.20,
    "time_fit": 0.15,
    "preference_fit": 0.15,
    "nutrition_signal": 0.10,
}

EXPIRY_SOON_DAYS = 7  # items expiring within this many days get a use-soon bonus


def _today() -> date:
    return datetime.now(timezone.utc).date()


def _expiry_status(expiry_date: Optional[date]) -> str:
    if expiry_date is None:
        return "unknown"
    today = _today()
    if expiry_date < today:
        return "expired"
    delta = (expiry_date - today).days
    if delta <= EXPIRY_SOON_DAYS:
        return "use_soon"
    return "fresh"


def _diet_compatible(recipe_diet_tags: list[str], user_diet: str) -> bool:
    """
    Returns False if the recipe violates the user's diet type.
    Unknown/empty tags → do not exclude (conservative: show with a caveat).
    """
    if user_diet == "no_preference":
        return True
    if not recipe_diet_tags:
        return True  # unknown diet → don't hard-exclude

    tags = {t.lower() for t in recipe_diet_tags}

    if user_diet == "vegan":
        return "vegan" in tags
    if user_diet == "vegetarian":
        return bool(tags & {"vegetarian", "vegan"})
    if user_diet == "eggetarian":
        return bool(tags & {"vegetarian", "vegan", "eggetarian", "egg"})
    if user_diet == "non_vegetarian":
        return True  # non-veg users can eat anything

    return True


def _has_allergen(recipe_allergen_tags: list[str], user_allergies: list[str]) -> bool:
    if not user_allergies:
        return False
    allergens = {a.lower() for a in recipe_allergen_tags}
    return bool(allergens & {a.lower() for a in user_allergies})


def _allergen_status(recipe_allergen_tags: list[str], user_allergies: list[str]) -> str:
    """Returns: 'safe'|'contains_allergen'|'unverified'"""
    if not recipe_allergen_tags:
        return "unverified"
    if _has_allergen(recipe_allergen_tags, user_allergies):
        return "contains_allergen"
    return "safe"


def score_recipe(
    *,
    recipe: dict,
    pantry_canonical: set[str],
    expiring_canonical: set[str],
    user_prefs: dict,
) -> Optional[dict]:
    """
    Score and classify a single recipe against the user's pantry.

    Returns a dict with recommendation data, or None if the recipe should
    be excluded (hard filter or too many missing ingredients).
    """
    # -----------------------------------------------------------------------
    # 1. Hard exclusions
    # -----------------------------------------------------------------------
    diet_type = user_prefs.get("diet_type", "no_preference")
    allergies = user_prefs.get("allergies", [])
    disliked = {normalize(d) for d in user_prefs.get("disliked_ingredients", [])}

    if not _diet_compatible(recipe.get("diet_tags", []), diet_type):
        return None

    if _has_allergen(recipe.get("allergen_tags", []), allergies):
        return None

    # -----------------------------------------------------------------------
    # 2. Build required ingredient set (normalized)
    # -----------------------------------------------------------------------
    ingredients_detail = recipe.get("ingredients_detail", [])
    required_canonical: list[str] = []
    optional_canonical: set[str] = set()

    for ing in ingredients_detail:
        canon = normalize(ing.get("name", ""))
        if is_pantry_staple(canon):
            optional_canonical.add(canon)
            continue
        if not ing.get("required", True):
            optional_canonical.add(canon)
            continue
        # Disliked ingredient check (soft exclusion on required ingredients)
        if canon in disliked:
            return None
        required_canonical.append(canon)

    # Fallback: if no ingredients_detail, use ingredient_names
    if not required_canonical and not ingredients_detail:
        for name in recipe.get("ingredient_names", []):
            canon = normalize(name)
            if not is_pantry_staple(canon):
                required_canonical.append(canon)

    if not required_canonical:
        return None  # skip recipes with no usable ingredient data

    required_set = set(required_canonical)
    missing = required_set - pantry_canonical
    matched = required_set - missing

    # -----------------------------------------------------------------------
    # 3. Categorize
    # -----------------------------------------------------------------------
    n_missing = len(missing)
    if n_missing == 0:
        category = "cook_now"
    elif n_missing <= 2:
        category = "almost_there"
    else:
        return None  # too many missing — excluded from main feed

    match_percent = int(round(len(matched) / len(required_set) * 100))

    # -----------------------------------------------------------------------
    # 4. Score
    # -----------------------------------------------------------------------
    # pantry_coverage component
    coverage_score = len(matched) / len(required_set)

    # expiry_bonus component: fraction of required pantry ingredients expiring soon
    expiring_used = matched & expiring_canonical
    expiry_score = len(expiring_used) / len(required_set) if expiring_used else 0.0

    # time_fit component
    max_minutes = user_prefs.get("max_cooking_minutes")
    recipe_time = recipe.get("total_time_minutes")
    if max_minutes and recipe_time:
        time_score = 1.0 if recipe_time <= max_minutes else max(0.0, 1.0 - (recipe_time - max_minutes) / max_minutes)
    elif max_minutes is None and recipe_time:
        time_score = 0.7  # some time data, no user limit → neutral
    else:
        time_score = 0.5  # unknown time

    # preference_fit component
    pref_score = 0.0
    preferred_cuisines = [c.lower() for c in user_prefs.get("preferred_cuisines", [])]
    recipe_cuisine = (recipe.get("cuisine") or "").lower()
    if preferred_cuisines:
        pref_score += 0.5 if recipe_cuisine in preferred_cuisines else 0.0
    else:
        pref_score += 0.5  # no cuisine preference → neutral
    if diet_type != "no_preference" and _diet_compatible(recipe.get("diet_tags", []), diet_type):
        pref_score += 0.5
    else:
        pref_score += 0.3
    pref_score = min(pref_score, 1.0)

    # nutrition component (only if data available)
    nutrition = recipe.get("nutrition_per_serving") or {}
    has_nutrition = nutrition.get("calories_kcal") is not None
    nutrition_score = 0.5 if has_nutrition else None  # neutral signal when present

    # Renormalize weights if nutrition data absent
    if nutrition_score is None:
        active_weights = {k: v for k, v in WEIGHTS.items() if k != "nutrition_signal"}
        total_w = sum(active_weights.values())
        normalized_weights = {k: v / total_w for k, v in active_weights.items()}
        final_score = (
            normalized_weights["pantry_coverage"] * coverage_score
            + normalized_weights["expiry_bonus"] * expiry_score
            + normalized_weights["time_fit"] * time_score
            + normalized_weights["preference_fit"] * pref_score
        )
    else:
        final_score = (
            WEIGHTS["pantry_coverage"] * coverage_score
            + WEIGHTS["expiry_bonus"] * expiry_score
            + WEIGHTS["time_fit"] * time_score
            + WEIGHTS["preference_fit"] * pref_score
            + WEIGHTS["nutrition_signal"] * nutrition_score
        )

    # -----------------------------------------------------------------------
    # 5. Human-readable recommendation reasons
    # -----------------------------------------------------------------------
    reasons: list[str] = []

    if n_missing == 0:
        reasons.append(f"Uses all {len(required_set)} ingredients in your pantry")
    else:
        reasons.append(f"Uses {len(matched)} of {len(required_set)} ingredients in your pantry")

    if expiring_used:
        names = ", ".join(sorted(expiring_used)[:2])
        reasons.append(f"Uses {names} that may expire soon")

    if recipe_time:
        reasons.append(f"Ready in about {recipe_time} minutes")

    if preferred_cuisines and recipe_cuisine in preferred_cuisines:
        reasons.append(f"Matches your {recipe_cuisine.title()} preference")

    if n_missing > 0:
        missing_display = sorted(missing)[:3]
        reasons.append(f"Needs only {', '.join(missing_display)}")

    allergen_status = _allergen_status(recipe.get("allergen_tags", []), allergies)

    # -----------------------------------------------------------------------
    # 6. Build ingredient availability detail for recipe detail screen
    # -----------------------------------------------------------------------
    ingredients_with_status = []
    for ing in ingredients_detail:
        canon = normalize(ing.get("name", ""))
        available = canon in pantry_canonical or is_pantry_staple(canon)
        ingredients_with_status.append({
            **ing,
            "canonical_name": canon,
            "available": available,
            "is_staple": is_pantry_staple(canon),
        })

    return {
        "recipe_id": str(recipe["_id"]),
        "title": recipe.get("title", ""),
        "cuisine": recipe.get("cuisine"),
        "diet_tags": recipe.get("diet_tags", []),
        "allergen_status": allergen_status,
        "category": category,
        "match_percent": match_percent,
        "matched_count": len(matched),
        "required_count": len(required_set),
        "missing_ingredients": sorted(missing),
        "total_time_minutes": recipe_time,
        "difficulty": recipe.get("difficulty"),
        "recommendation_reasons": reasons,
        "nutrition": nutrition if has_nutrition else None,
        "image_url": recipe.get("image_url"),
        "source_url": recipe.get("source_url"),
        "average_rating": recipe.get("average_rating"),
        "score": round(final_score, 4),
        "ingredients_with_status": ingredients_with_status,
    }


def rank_recommendations(
    recipes: list[dict],
    pantry_items: list[dict],
    user_prefs: dict,
    mode: str,
) -> list[dict]:
    """
    Main entry point: score all recipes against pantry, filter by mode,
    and return ranked list.

    Args:
        recipes: list of raw recipe dicts from MongoDB
        pantry_items: list of pantry_item dicts for the current user
        user_prefs: user_preferences dict
        mode: "cook_now" | "almost_there"
    """
    # Build pantry sets
    pantry_canonical: set[str] = set()
    expiring_canonical: set[str] = set()
    today = _today()

    for item in pantry_items:
        canon = normalize(item.get("display_name", ""))
        expiry_date = item.get("expiry_date")
        if isinstance(expiry_date, str):
            try:
                expiry_date = date.fromisoformat(expiry_date)
            except ValueError:
                expiry_date = None

        pantry_canonical.add(canon)
        if expiry_date and isinstance(expiry_date, date):
            days_left = (expiry_date - today).days
            if 0 <= days_left <= EXPIRY_SOON_DAYS:
                expiring_canonical.add(canon)

    results: list[dict] = []
    for recipe in recipes:
        scored = score_recipe(
            recipe=recipe,
            pantry_canonical=pantry_canonical,
            expiring_canonical=expiring_canonical,
            user_prefs=user_prefs,
        )
        if scored and scored["category"] == mode:
            results.append(scored)

    # Sort by score descending
    results.sort(key=lambda x: x["score"], reverse=True)
    return results
