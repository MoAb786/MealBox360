from fastapi import APIRouter, HTTPException, Query, Depends
from pydantic import BaseModel
from typing import Optional

from app.core.security import get_current_user_id
from app.services.barcode import lookup_barcode_product
from app.services.nutrition import lookup_ingredient_nutrition

router = APIRouter()


class BarcodeRequest(BaseModel):
    barcode: str


@router.post("/barcode-lookup")
async def barcode_lookup(body: BarcodeRequest, user_id: str = Depends(get_current_user_id)):
    product = await lookup_barcode_product(body.barcode)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found for this barcode in Open Food Facts")
    return product


@router.get("/nutrition/ingredient")
async def ingredient_nutrition(
    q: str = Query(..., min_length=1),
    user_id: str = Depends(get_current_user_id),
):
    nutri = await lookup_ingredient_nutrition(q)
    if not nutri:
        return {
            "query": q,
            "nutrition": None,
            "message": "Nutrition information unavailable or USDA key not configured",
        }
    return {"query": q, "nutrition": nutri}
