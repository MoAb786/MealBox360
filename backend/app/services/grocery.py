"""
Grocery Price Provider Interface Stub (Phase 4 Planning)

Per implementation plan §5.3:
We do not hard-code unofficial private endpoints or scrape live Zepto/Blinkit/Swiggy.
This interface defines the adapter contract for future official partner integrations.
"""
from abc import ABC, abstractmethod
from typing import List, Dict, Any


class GroceryPriceProvider(ABC):
    @abstractmethod
    async def search_product(self, ingredient: str, postal_code: str) -> List[Dict[str, Any]]:
        """
        Search for available packaged or fresh food items with prices.

        Returns list of dicts with:
        - merchant: str (e.g. "Zepto", "Blinkit", "Swiggy Instamart")
        - product_name: str
        - package_size: str (e.g. "500 g", "1 kg")
        - price_inr: float
        - postal_code: str
        - timestamp: datetime
        - availability: bool
        - source: str
        """
        pass
