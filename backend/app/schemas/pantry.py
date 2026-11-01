from pydantic import BaseModel, Field
from typing import Optional
from datetime import date, datetime


class PantryItemIn(BaseModel):
    display_name: str = Field(min_length=1, max_length=200)
    quantity: Optional[float] = None
    unit: Optional[str] = None
    category: Optional[str] = None
    expiry_date: Optional[date] = None
    notes: Optional[str] = None
    source: str = "manual"


class PantryItemUpdate(BaseModel):
    display_name: Optional[str] = None
    quantity: Optional[float] = None
    unit: Optional[str] = None
    category: Optional[str] = None
    expiry_date: Optional[date] = None
    notes: Optional[str] = None


class PantryItemOut(BaseModel):
    id: str
    user_id: str
    ingredient_id: Optional[str] = None
    display_name: str
    canonical_name: Optional[str] = None
    quantity: Optional[float] = None
    unit: Optional[str] = None
    category: Optional[str] = None
    expiry_date: Optional[date] = None
    added_at: datetime
    updated_at: datetime
    source: str
    notes: Optional[str] = None
    expiry_status: Optional[str] = None  # fresh|use_soon|expired|unknown
