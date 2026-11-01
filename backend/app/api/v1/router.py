from fastapi import APIRouter
from app.api.v1 import auth, pantry, recipes, history, profile, products

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(profile.router, prefix="", tags=["Profile"])
api_router.include_router(pantry.router, prefix="/pantry", tags=["Pantry"])
api_router.include_router(recipes.router, prefix="/recipes", tags=["Recipes"])
api_router.include_router(history.router, prefix="/meals", tags=["Meal History"])
api_router.include_router(products.router, prefix="", tags=["Products & Nutrition"])
