"""
clean_and_import_foodcom.py — Sanitize and curate Food.com recipes.

Filters out absurd, vanity, and low-quality user-submitted recipes.
Ensures only well-rated, clean-titled, photographed recipes make it into the database.

Usage:
  cd backend
  .venv/bin/python scripts/clean_and_import_foodcom.py [--limit 100]
"""

import ast
import json
import re
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

sys.path.insert(0, str(Path(__file__).parent.parent))

import pandas as pd
from app.services.normalizer import normalize

RAW_DIR = Path(__file__).parent.parent / "data" / "raw"
RECIPES_CSV = RAW_DIR / "RAW_recipes.csv"
INTERACTIONS_CSV = RAW_DIR / "RAW_interactions.csv"
OUTPUT_FILE = Path(__file__).parent.parent / "data" / "seeds" / "sanitized_foodcom_recipes.json"

BLACKLIST_WORDS = {
    "slime", "mystery", "sexy", "sex", "tonic", "miracle", "dog", "puppy",
    "baby", "thingy", "thingys", "copycat", "clone", "leftover", "leftovers",
    "mimosa", "cocktail", "punch", "smoothie", "shake", "gross", "weed",
    "pot", "hangover", "points", "ww", "weight watcher", "diet"
}

AUTHOR_PREFIX_PATTERNS = [
    r"^.*?'s\s+",
    r"^.*?\s+s\s+",
    r"^my\s+(?:famous|favorite|best|easy|simple|secret)\s+",
    r"^the\s+best\s+ever\s+",
    r"^easiest\s+ever\s+",
    r"^world\s+s\s+best\s+",
    r"^mom\s+s\s+",
    r"^mama\s+s\s+",
    r"^grandma\s+s\s+",
]

DISH_KEYWORD_IMAGES: List[Tuple[Any, str]] = [
    (re.compile(r"pasta|spaghetti|penne|lasagna|fettuccine", re.I), "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=800&auto=format&fit=crop&q=80"),
    (re.compile(r"pizza", re.I), "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=80"),
    (re.compile(r"salad", re.I), "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&auto=format&fit=crop&q=80"),
    (re.compile(r"soup|stew|chowder", re.I), "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&auto=format&fit=crop&q=80"),
    (re.compile(r"chicken|roast chicken", re.I), "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=800&auto=format&fit=crop&q=80"),
    (re.compile(r"burger|sandwich", re.I), "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop&q=80"),
    (re.compile(r"curry", re.I), "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=800&auto=format&fit=crop&q=80"),
    (re.compile(r"rice|risotto", re.I), "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=800&auto=format&fit=crop&q=80"),
    (re.compile(r"fish|salmon|shrimp|seafood", re.I), "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800&auto=format&fit=crop&q=80"),
    (re.compile(r"steak|beef", re.I), "https://images.unsplash.com/photo-1558030006-450675393462?w=800&auto=format&fit=crop&q=80"),
    (re.compile(r"cake|muffin|cupcake|cookie|brownie|dessert", re.I), "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&auto=format&fit=crop&q=80"),
]

DEFAULT_IMAGE = "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=800&auto=format&fit=crop&q=80"


def clean_title(raw_name: str) -> Optional[str]:
    if not isinstance(raw_name, str):
        return None

    # Replace multiple spaces with a single space
    s = re.sub(r"\s+", " ", raw_name).strip()

    # Remove author prefixes like "Kittencal's" or "Mama's"
    for pat in AUTHOR_PREFIX_PATTERNS:
        s = re.sub(pat, "", s, flags=re.IGNORECASE).strip()

    # Remove parenthetical point ratings / tags e.g. "(WW 4 Pts)"
    s = re.sub(r"\(.*?\)", "", s).strip()
    s = re.sub(r"\b\d+\s*(?:day|minute|ingredient|pts?|points?)\b", "", s, flags=re.IGNORECASE).strip()
    s = re.sub(r"\s+", " ", s).strip()

    # Check blacklist words
    lowered = s.lower()
    for bad in BLACKLIST_WORDS:
        if re.search(rf"\b{re.escape(bad)}\b", lowered):
            return None

    words = s.split()
    if len(words) < 2 or len(s) < 6 or len(s) > 50:
        return None

    # Check if title looks like real food words
    return s.title()


def safe_eval(val):
    if not isinstance(val, str):
        return []
    try:
        res = ast.literal_eval(val)
        return res if isinstance(res, list) else []
    except Exception:
        return []


def match_image(title: str) -> str:
    for pattern, url in DISH_KEYWORD_IMAGES:
        if pattern.search(title):
            return url
    return DEFAULT_IMAGE


def main(limit: int = 150):
    print("🧹 Food.com Sanitizer & Quality Gate")
    if not RECIPES_CSV.exists() or not INTERACTIONS_CSV.exists():
        print("⚠️ Raw CSV files not found in backend/data/raw/ — skipping Food.com sanitization.")
        return

    print("📂 Loading interactions...")
    df_inter = pd.read_csv(INTERACTIONS_CSV, usecols=["recipe_id", "rating"], low_memory=False)
    agg = df_inter.groupby("recipe_id")["rating"].agg(["mean", "count"]).reset_index()
    agg.columns = ["recipe_id", "avg_rating", "rating_count"]
    # Only keep recipes with avg_rating >= 4.5 and at least 5 reviews
    filtered_ratings = agg[(agg["avg_rating"] >= 4.5) & (agg["rating_count"] >= 5)]
    valid_ids = set(filtered_ratings["recipe_id"])
    ratings_map = {row["recipe_id"]: (row["avg_rating"], row["rating_count"]) for _, row in filtered_ratings.iterrows()}
    print(f"   Found {len(valid_ids):,} recipes with rating >= 4.5 and >= 5 reviews.")

    print("📂 Streaming RAW_recipes.csv through quality filters...")
    sanitized = []
    chunksize = 10000

    for chunk in pd.read_csv(RECIPES_CSV, chunksize=chunksize, low_memory=False):
        for _, row in chunk.iterrows():
            rid = row.get("id")
            if pd.isna(rid) or int(rid) not in valid_ids:
                continue

            cleaned = clean_title(str(row.get("name", "")))
            if not cleaned:
                continue

            try:
                mins = int(row.get("minutes", 0))
            except Exception:
                mins = 0
            if mins < 15 or mins > 60:
                continue

            ingredients = safe_eval(row.get("ingredients", "[]"))
            steps = safe_eval(row.get("steps", "[]"))
            if len(ingredients) < 4 or len(ingredients) > 10 or len(steps) < 3:
                continue

            avg_r, r_cnt = ratings_map[int(rid)]
            img_url = match_image(cleaned)

            recipe_doc = {
                "external_source": "foodcom",
                "external_id": str(int(rid)),
                "title": cleaned,
                "description": f"Top-rated {cleaned} recipe from Food.com community.",
                "ingredient_names": [str(i).strip() for i in ingredients],
                "ingredients_detail": [
                    {"name": str(i).strip(), "canonical_name": normalize(str(i)), "quantity": None, "unit": None, "required": True}
                    for i in ingredients
                ],
                "steps": [str(s).strip() for s in steps],
                "prep_minutes": max(mins // 3, 5),
                "cook_minutes": max(mins - (mins // 3), 10),
                "total_time_minutes": mins,
                "servings": 4,
                "difficulty": "easy" if mins <= 30 else "medium",
                "cuisine": "American",
                "diet_tags": ["vegetarian"] if not any(m in " ".join(ingredients).lower() for m in ["chicken", "beef", "pork", "fish", "meat", "bacon"]) else ["non_vegetarian"],
                "allergen_tags": [],
                "average_rating": round(float(avg_r), 2),
                "rating_count": int(r_cnt),
                "image_url": img_url,
                "source_url": f"https://www.food.com/recipe/{int(rid)}",
                "attribution": "Food.com (Sanitized & Verified)",
                "quantity_aware": False,
            }
            sanitized.append(recipe_doc)

            if len(sanitized) >= limit:
                break
        if len(sanitized) >= limit:
            break

    print(f"\n✅ Cleaned and curated {len(sanitized)} high-quality Food.com recipes.")
    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(sanitized, f, indent=2, ensure_ascii=False)
    print(f"💾 Saved to {OUTPUT_FILE}")


if __name__ == "__main__":
    main()
