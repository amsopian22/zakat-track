import os
import io
import uuid
import datetime
import qrcode
from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional

from ai_engine.database import engine, get_db, Base
from ai_engine.models import MustahikModel, DonationModel
from ai_engine.schemas import MustahikCreate, MustahikRead, DonationCreate, DonationRead, DonationDisburse
from ai_engine.utils import saw_scoring, SDGS_MAP, WEIGHTS, TYPES
from ai_engine.ai_advisor import AIAdvisor

from dotenv import load_dotenv
load_dotenv()

# Create tables (Alembic is recommended for production)
# Base.metadata.create_all(bind=engine) # Handled by migrations

from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield

app = FastAPI(title="ZakatTrack API v1.1 - Modular", lifespan=lifespan)

# --- Dynamic Configuration ---
# CORS Setup
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173,http://localhost:5174,http://127.0.0.1:5174").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize AI Advisor
ai_advisor = AIAdvisor()

# Security Pattern
# CRITICAL: Always use .env for production secrets
API_KEY = os.getenv("ZAKATTRACK_API_KEY")
if not API_KEY:
    # Terpaksa menggunakan fallback hanya untuk dev, tetapi dengan peringatan keras
    API_KEY = "zakat-secret-2026" 

GK_SAMARINDA = int(os.getenv("GK_SAMARINDA", "720000"))

async def verify_api_key(x_api_key: Optional[str] = Header(None)):
    if x_api_key is None or x_api_key != API_KEY:
        raise HTTPException(status_code=403, detail="Akses ditolak: API Key tidak valid atau tidak disertakan")
    return x_api_key

@app.get("/")
async def root():
    """
    Root endpoint to check API status.
    
    Returns:
        dict: Status and version of the API.
    """
    return {"status": "Online", "version": "1.1.0-CloudReady"}

@app.post("/api/v1/mustahik", response_model=MustahikRead)
async def create_mustahik(data: MustahikCreate, db: AsyncSession = Depends(get_db), _ = Depends(verify_api_key)):
    """
    Create a new Mustahik record.
    
    Args:
        data (MustahikCreate): The mustahik data to create.
        db (AsyncSession): Database session.
        _ (str): API Key validation placeholder.
        
    Returns:
        MustahikModel: The created mustahik record.
    """
    if not data.id:
        data.id = str(uuid.uuid4())
        
    if not data.nim:
        data.nim = f"MST-{datetime.datetime.now().strftime('%y%m%d%H%M')}"
        
    income_pc = data.income / max(1, data.dependents)
    gk = GK_SAMARINDA
    asnaf = "Fakir" if income_pc < (0.5*gk) else ("Miskin" if income_pc < gk else "Mampu")
    sdg = SDGS_MAP.get(asnaf, "SDG 1: No Poverty")
    
    from sqlalchemy import select
    query = select(MustahikModel).where(MustahikModel.nim == data.nim)
    result = await db.execute(query)
    existing = result.scalar_one_or_none()
    
    if existing:
        raise HTTPException(status_code=400, detail="Data mustahik dengan NIM tersebut sudah ada (Anti-Fraud)")

    db_mustahik = MustahikModel(**data.model_dump(), asnaf_category=asnaf, sdgs_label=sdg)
    db.add(db_mustahik)
    await db.commit()
    await db.refresh(db_mustahik)
    return db_mustahik

@app.delete("/api/v1/mustahik/{mustahik_id}")
async def delete_mustahik(mustahik_id: str, db: AsyncSession = Depends(get_db), _ = Depends(verify_api_key)):
    """
    Delete a Mustahik record by ID.
    
    Args:
        mustahik_id (str): UUID of the mustahik.
        db (AsyncSession): Database session.
    """
    from sqlalchemy import select
    query = select(MustahikModel).where(MustahikModel.id == mustahik_id)
    result = await db.execute(query)
    mustahik = result.scalar_one_or_none()
    
    if not mustahik:
        raise HTTPException(status_code=404, detail="Mustahik not found")
    await db.delete(mustahik)
    await db.commit()
    return {"message": "Mustahik deleted successfully"}

@app.get("/api/v1/mustahiks", response_model=list[MustahikRead])
async def list_mustahiks(db: AsyncSession = Depends(get_db)):
    """
    List all mustahiks with priority scoring.
    """
    from sqlalchemy import select
    query = select(MustahikModel)
    result = await db.execute(query)
    mustahiks = result.scalars().all()
    
    if not mustahiks: return []
    
    data = [[m.income, m.dependents, m.assets, m.house_status, m.utility_exp, m.health_status] for m in mustahiks]
    scores = saw_scoring(data, WEIGHTS, TYPES)
    
    results = []
    for i, m in enumerate(mustahiks):
        m_dict = {c.name: getattr(m, c.name) for c in m.__table__.columns}
        m_dict['priority_score'] = float(scores[i])
        results.append(m_dict)
    
    return sorted(results, key=lambda x: x['priority_score'], reverse=True)

@app.get("/api/v1/donation/qrcode/{donation_id}")
async def get_donation_qr(donation_id: str):
    url = f"https://zakattrack.id/track/{donation_id}"
    qr = qrcode.QRCode(version=1, box_size=10, border=5)
    qr.add_data(url)
    qr.make(fit=True)
    
    img = qr.make_image(fill_color="black", back_color="white")
    buf = io.BytesIO()
    img.save(buf)
    buf.seek(0)
    return StreamingResponse(buf, media_type="image/png")

@app.get("/api/v1/ai/insight")
async def get_ai_insight(db: AsyncSession = Depends(get_db)):
    """
    Get AI-driven insights about mustahik priorities.
    """
    mustahiks = await list_mustahiks(db)
    if not mustahiks:
        return {"insight": "Belum ada data untuk dianalisis."}
    
    insight = await ai_advisor.analyze_mustahik_priority(mustahiks)
    return {"insight": insight}

@app.get("/api/v1/track/{donation_id}")
async def track_donation(donation_id: str, db: AsyncSession = Depends(get_db)):
    """
    Track a donation impact.
    """
    return {
        "donation_id": donation_id,
        "status": "Tersalurkan",
        "mustahik_name": "Pak Ahmad (Anonymized)",
        "location": {"lat": -0.502, "lng": 117.153},
        "description": "Dana disalurkan untuk bantuan sembako dan modal usaha."
    }

# --- Donation Ecosystem Endpoints ---

@app.post("/api/v1/donation", response_model=DonationRead)
async def record_donation(data: DonationCreate, db: AsyncSession = Depends(get_db), _ = Depends(verify_api_key)):
    """
    Record a new incoming donation from a Muzakki.
    """
    donation_id = str(uuid.uuid4())
    # Simple hash for QR (in real app, use more secure or unique data)
    qr_hash = str(uuid.uuid4()).split('-')[0].upper()
    
    db_donation = DonationModel(
        id=donation_id,
        muzakki_name=data.muzakki_name,
        amount=data.amount,
        transaction_type="IN",
        status="PENDING",
        sdgs_goal=data.sdgs_goal,
        qr_code_hash=qr_hash
    )
    db.add(db_donation)
    await db.commit()
    await db.refresh(db_donation)
    return db_donation

@app.post("/api/v1/donation/disburse", response_model=DonationRead)
async def disburse_donation(data: DonationDisburse, db: AsyncSession = Depends(get_db), _ = Depends(verify_api_key)):
    """
    Disburse an existing donation to a specific Mustahik.
    """
    from sqlalchemy import select
    # 1. Get Donation
    res = await db.execute(select(DonationModel).where(DonationModel.id == data.donation_id))
    donation = res.scalar_one_or_none()
    if not donation:
        raise HTTPException(status_code=404, detail="Donasi tidak ditemukan")
    
    if donation.status == "DISBURSED":
        raise HTTPException(status_code=400, detail="Donasi sudah disalurkan sebelumnya")
    
    # 2. Get Mustahik for SDG Labeling
    res_m = await db.execute(select(MustahikModel).where(MustahikModel.id == data.mustahik_id))
    mustahik = res_m.scalar_one_or_none()
    if not mustahik:
        raise HTTPException(status_code=404, detail="Mustahik tidak ditemukan")
    
    # 3. Update Donation
    donation.mustahik_id = data.mustahik_id
    donation.status = "DISBURSED"
    donation.transaction_type = "OUT"
    donation.sdgs_goal = mustahik.sdgs_label or "SDG 1: No Poverty"
    
    await db.commit()
    await db.refresh(donation)
    return donation

@app.get("/api/v1/donations", response_model=list[DonationRead])
async def list_donations(db: AsyncSession = Depends(get_db)):
    """
    Get all donation transactions history.
    """
    from sqlalchemy import select
    res = await db.execute(select(DonationModel).order_by(DonationModel.transaction_date.desc()))
    return res.scalars().all()
