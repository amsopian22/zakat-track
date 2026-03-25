import asyncio
import uuid
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from ai_engine.database import Base, get_db
from ai_engine.main import app
from ai_engine.models import MustahikModel

# --- Test Setup ---
SQLALCHEMY_DATABASE_URL = "sqlite+aiosqlite:///:memory:"
engine = create_async_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

async def override_get_db():
    async with TestingSessionLocal() as session:
        yield session

app.dependency_overrides[get_db] = override_get_db

async def run_tests():
    print("🚀 Starting Donation Ecosystem Tests...")
    
    # Setup Database
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        headers = {"X-API-KEY": "zakat-secret-2026"}
        
        # 1. Setup Mustahik
        async with TestingSessionLocal() as db:
            mustahik = MustahikModel(
                id="m1", nim="123", name="Test Mustahik", nik="1234567890123456",
                income=100000, dependents=5, sdgs_label="SDG 2: Zero Hunger"
            )
            db.add(mustahik)
            await db.commit()
        print("✅ Mustahik setup complete.")

        # 2. Record Donation
        res = await ac.post("/api/v1/donation", json={
            "muzakki_name": "Donatur A",
            "amount": 1000000
        }, headers=headers)
        assert res.status_code == 200
        don_id = res.json()["id"]
        print(f"✅ Donation recorded: {don_id}")

        # 3. Disburse Donation
        res = await ac.post("/api/v1/donation/disburse", json={
            "donation_id": don_id,
            "mustahik_id": "m1"
        }, headers=headers)
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "DISBURSED"
        assert data["sdgs_goal"] == "SDG 2: Zero Hunger"
        print("✅ Disbursement successful.")

        # 4. List History
        res = await ac.get("/api/v1/donations", headers=headers)
        assert res.status_code == 200
        assert len(res.json()) >= 1
        print("✅ History list verified.")

    print("🎉 All Donation Tests Passed!")

if __name__ == "__main__":
    asyncio.run(run_tests())
