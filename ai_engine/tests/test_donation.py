import pytest
import asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from ai_engine.database import Base, get_db
from ai_engine.main import app
from ai_engine.models import MustahikModel, DonationModel
import uuid

# --- Test Setup ---
SQLALCHEMY_DATABASE_URL = "sqlite+aiosqlite:///:memory:"
engine = create_async_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

async def override_get_db():
    async with TestingSessionLocal() as session:
        yield session

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(scope="module")
def event_loop():
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()

@pytest.fixture(autouse=True, scope="module")
async def setup_database():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

# --- Tests ---

@pytest.mark.asyncio
async def test_donation_full_flow():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        headers = {"X-API-KEY": "zakat-secret-2026"}
        
        # 1. Manually insert a Mustahik for disbursement testing
        async with TestingSessionLocal() as db:
            mustahik = MustahikModel(
                id="m1", nim="123", name="Test Mustahik", nik="1234567890123456",
                income=100000, dependents=5, sdgs_label="SDG 2: Zero Hunger"
            )
            db.add(mustahik)
            await db.commit()

        # 2. Record Donation (IN)
        res = await ac.post("/api/v1/donation", json={
            "muzakki_name": "Muzakki A",
            "amount": 1000000
        }, headers=headers)
        assert res.status_code == 200
        don_id = res.json()["id"]
        assert res.json()["status"] == "PENDING"

        # 3. Disburse Donation (OUT)
        res = await ac.post("/api/v1/donation/disburse", json={
            "donation_id": don_id,
            "mustahik_id": "m1"
        }, headers=headers)
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "DISBURSED"
        assert data["mustahik_id"] == "m1"
        assert data["sdgs_goal"] == "SDG 2: Zero Hunger"
        assert data["transaction_type"] == "OUT"

        # 4. Verify History
        res = await ac.get("/api/v1/donations", headers=headers)
        assert res.status_code == 200
        assert len(res.json()) == 1

@pytest.mark.asyncio
async def test_donation_security():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # Test without X-API-KEY
        response = await ac.post("/api/v1/donation", json={
            "muzakki_name": "Ghost",
            "amount": 1000
        })
        assert response.status_code == 403
