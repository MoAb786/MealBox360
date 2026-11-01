"""
Open Food Facts Barcode Product Lookup Adapter
Uses Open Food Facts v3 API with identifying User-Agent.
"""
from typing import Optional
import httpx
from app.core.config import settings

OFF_BASE_URL = "https://world.openfoodfacts.org/api/v3/product"


async def lookup_barcode_product(barcode: str) -> Optional[dict]:
    """
    Look up a product by barcode string in Open Food Facts.
    Returns normalized product details.
    """
    headers = {
        "User-Agent": settings.openfoodfacts_user_agent,
    }

    try:
        async with httpx.AsyncClient(timeout=6.0, headers=headers) as client:
            resp = await client.get(f"{OFF_BASE_URL}/{barcode}.json")
            if resp.status_code != 200:
                return None

            data = resp.json()
            if data.get("status") != "success" and data.get("status_verbose") != "product found":
                # Fallback check
                if not data.get("product"):
                    return None

            product = data.get("product", {})
            name = product.get("product_name") or product.get("product_name_en") or "Unknown Product"
            brands = product.get("brands")
            categories = product.get("categories", "")

            nutriments = product.get("nutriments", {})

            return {
                "barcode": barcode,
                "product_name": name,
                "brands": brands,
                "category": categories.split(",")[0].strip() if categories else None,
                "nutrition_per_100g": {
                    "calories_kcal": nutriments.get("energy-kcal_100g") or nutriments.get("energy-kcal"),
                    "protein_g": nutriments.get("proteins_100g"),
                    "carbohydrates_g": nutriments.get("carbohydrates_100g"),
                    "fat_g": nutriments.get("fat_100g"),
                },
                "source": "Open Food Facts",
            }
    except Exception as e:
        print(f"⚠️ Open Food Facts API error: {e}")
        return None
