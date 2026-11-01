import pytest
from httpx import AsyncClient, ASGITransport
from main import app
from app.db.client import connect_db, close_db

@pytest.mark.asyncio
async def test_login_demo_users():
    await connect_db()
    try:
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            # 1. Login with demo@mealbox360.com
            res1 = await client.post("/api/v1/auth/login", json={
                "email": "demo@mealbox360.com",
                "password": "demo1234"
            })
            assert res1.status_code == 200, res1.text
            token1 = res1.json().get("access_token")
            assert token1 is not None

            # 2. Login with demo@mealbox360.local (should now also succeed without validation error)
            res2 = await client.post("/api/v1/auth/login", json={
                "email": "demo@mealbox360.local",
                "password": "demo1234"
            })
            assert res2.status_code == 200, res2.text
            token2 = res2.json().get("access_token")
            assert token2 is not None

            # 3. Test /me with token
            res_me = await client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token1}"})
            assert res_me.status_code == 200
            assert res_me.json()["email"] == "demo@mealbox360.com"
    finally:
        await close_db()
