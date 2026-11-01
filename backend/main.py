from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from typing import List

app = FastAPI()

# Allow CORS for Expo Go local testing
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mock Database (to be replaced by MongoDB in Phase 2)
db_pantry = ["tomato", "onion", "garlic"]
db_recipes = [
    {"id": 1, "name": "Tomato Soup", "ingredients": ["tomato", "garlic", "salt", "water"]},
    {"id": 2, "name": "Onion Rings", "ingredients": ["onion", "flour", "oil"]},
    {"id": 3, "name": "Garlic Bread", "ingredients": ["garlic", "bread", "butter"]}
]

class Ingredient(BaseModel):
    name: str

@app.get("/pantry")
def get_pantry():
    return {"pantry": db_pantry}

@app.post("/pantry/add")
def add_ingredient(item: Ingredient):
    if item.name.lower() not in db_pantry:
        db_pantry.append(item.name.lower())
    return {"message": "Added successfully", "pantry": db_pantry}

@app.get("/recommendations")
def get_recommendations():
    # Phase 1: Simple Content-Based Matching Logic
    recommendations = []
    for recipe in db_recipes:
        recipe_ings = set(recipe["ingredients"])
        pantry_set = set(db_pantry)
        match_count = len(recipe_ings.intersection(pantry_set))
        total = len(recipe_ings)
        
        if match_count == total:
            status = "Cook Now (100% Match)"
        elif match_count >= total - 2:
            status = f"Almost There (Missing {total - match_count} items)"
        else:
            continue # Needs too many items
            
        recommendations.append({
            "recipe": recipe["name"],
            "status": status,
            "match_rate": f"{match_count}/{total}",
            "missing": list(recipe_ings - pantry_set)
        })
    
    # Sort by best match
    recommendations.sort(key=lambda x: x['status'], reverse=True)
    return {"recommendations": recommendations}
