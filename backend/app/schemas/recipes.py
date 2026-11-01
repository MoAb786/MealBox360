from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class NutritionInfo(BaseModel):
    calories_kcal: Optional[float] = None
    protein_g: Optional[float] = None
    carbohydrates_g: Optional[float] = None
    fat_g: Optional[float] = None
    source: Optional[str] = None
    is_estimate: bool = True


class IngredientDetail(BaseModel):
    name: str
    canonical_name: Optional[str] = None
    quantity: Optional[float] = None
    unit: Optional[str] = None
    required: bool = True
    available: Optional[bool] = None  # populated during recommendation


class RecipeOut(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    cuisine: Optional[str] = None
    diet_tags: List[str] = []
    allergen_tags: List[str] = []
    difficulty: Optional[str] = None
    total_time_minutes: Optional[int] = None
    prep_minutes: Optional[int] = None
    cook_minutes: Optional[int] = None
    servings: Optional[int] = None
    ingredient_names: List[str] = []
    ingredients_detail: List[IngredientDetail] = []
    steps: List[str] = []
    nutrition_per_serving: Optional[NutritionInfo] = None
    image_url: Optional[str] = None
    source_url: Optional[str] = None
    attribution: Optional[str] = None
    average_rating: Optional[float] = None
    rating_count: int = 0
    quantity_aware: bool = False


class RecommendationItem(BaseModel):
    recipe_id: str
    title: str
    cuisine: Optional[str] = None
    diet_tags: List[str] = []
    match_percent: int
    matched_count: int
    required_count: int
    missing_ingredients: List[str] = []
    total_time_minutes: Optional[int] = None
    difficulty: Optional[str] = None
    recommendation_reasons: List[str] = []
    nutrition: Optional[NutritionInfo] = None
    image_url: Optional[str] = None
    source_url: Optional[str] = None
    average_rating: Optional[float] = None
    score: float = 0.0


class RecommendationResponse(BaseModel):
    mode: str
    items: List[RecommendationItem]
    total: int


class MealHistoryIn(BaseModel):
    recipe_id: str
    servings: int = 1
    rating: Optional[int] = None  # 1-5
    notes: Optional[str] = None
    cooked_at: Optional[datetime] = None


class MealHistoryUpdate(BaseModel):
    rating: Optional[int] = None
    notes: Optional[str] = None
    servings: Optional[int] = None


class MealHistoryOut(BaseModel):
    id: str
    user_id: str
    recipe_id: str
    recipe_title_snapshot: str
    cooked_at: datetime
    servings: int
    rating: Optional[int] = None
    notes: Optional[str] = None
    ingredients_used: List[str] = []
