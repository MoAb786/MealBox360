from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime


class UserRegister(BaseModel):
    email: str = Field(min_length=3, max_length=255)
    password: str = Field(min_length=6)
    display_name: str = Field(min_length=1, max_length=100)


class UserLogin(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserOut(BaseModel):
    id: str
    email: str
    display_name: str
    created_at: datetime
    is_active: bool


class UserPreferencesIn(BaseModel):
    diet_type: str = "no_preference"  # vegetarian|eggetarian|non_vegetarian|vegan|no_preference
    allergies: list[str] = []
    disliked_ingredients: list[str] = []
    preferred_cuisines: list[str] = []
    max_cooking_minutes: Optional[int] = None
    budget_per_serving_inr: Optional[float] = None
    cooking_skill: str = "beginner"   # beginner|intermediate|confident
    servings_default: int = 1


class UserPreferencesOut(UserPreferencesIn):
    user_id: str
    updated_at: Optional[datetime] = None
