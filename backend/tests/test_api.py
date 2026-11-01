import pytest
from httpx import AsyncClient, ASGITransport
from main import app

@pytest.mark.asyncio
async def test_health_check():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        res = await client.get("/health")
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "ok"
        assert data["version"] == "2.0.0"

@pytest.mark.asyncio
async def test_legacy_aliases():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        res1 = await client.get("/pantry")
        assert res1.status_code == 200
        assert "pantry" in res1.json()

        res2 = await client.get("/recommendations")
        assert res2.status_code == 200
        assert "recommendations" in res2.json()
