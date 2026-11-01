from pydantic_settings import BaseSettings
from typing import List
import os


class Settings(BaseSettings):
    app_env: str = "development"
    jwt_secret_key: str = "change-this-secret"
    jwt_access_token_expire_minutes: int = 60
    mongodb_uri: str = "mongodb://localhost:27017"
    mongodb_database: str = "mealbox360"
    cors_origins: str = "http://localhost:8081,http://127.0.0.1:8081"
    themealdb_api_key: str = "1"
    usda_fdc_api_key: str = ""
    openfoodfacts_user_agent: str = "MealBox360/1.0"

    @property
    def cors_origins_list(self) -> List[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    model_config = {"env_file": os.path.join(os.path.dirname(__file__), "../../.env"), "extra": "ignore"}


settings = Settings()
