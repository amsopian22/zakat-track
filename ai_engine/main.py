import os
import io
import uuid
import datetime
import qrcode
from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional

from ai_engine.database import engine, get_db, Base
from ai_engine.models import MustahikModel
from ai_engine.schemas import MustahikCreate
from ai_engine.utils import saw_scoring, SDGS_MAP, WEIGHTS, TYPES
from ai_engine.ai_advisor import AIAdvisor

from dotenv import load_dotenv
load_dotenv()

# Create tables (Alembic is recommended for production)
Base.metadata.create_all(bind=engine)

app = FastAPI(title="ZakatTrack API v1.1 - Modular")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5173", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize AI Advisor
ai_advisor = AIAdvisor()

# Phase 2: Simple Security Pattern
API_KEY = os.getenv("ZAKATTRACK_API_KEY", "zakat-secret-2026")
GK_SAMARINDA = int(os.getenv("GK_SAMARINDA", "720000"))

async def verify_api_key(x_api_key: str = Header(...)):
    if x_api_key != API_KEY:
        raise HTTPException(status_code=403, detail="Akses ditolak: API Key tidak valid")
    return x_api_key

@app.get("/")
async def root():
    return {"status": "Online", "version": "1.1.0-CloudReady"}

@app.post("/api/v1/mustahik")
async def create_mustahik(data: MustahikCreate, db: Session = Depends(get_db), _ = Depends(verify_api_key)):
    if not data.id:
        data.id = str(uuid.uuid4())
        
    if not data.nim:
        data.nim = f"MST-{datetime.datetime.now().strftime('%y%m%d%H%M')}"
        
    income_pc = data.income / max(1, data.dependents)
    gk = GK_SAMARINDA
    asnaf = "Fakir" if income_pc < (0.5*gk) else ("Miskin" if income_pc < gk else "Mampu")
    sdg = SDGS_MAP.get(asnaf, "SDG 1: No Poverty")
    
    existing = db.query(MustahikModel).filter(MustahikModel.nim == data.nim).first()
    if existing:
        raise HTTPException(status_code=400, detail="Data mustahik dengan NIM tersebut sudah ada (Anti-Fraud)")

    db_mustahik = MustahikModel(**data.model_dump(), asnaf_category=asnaf, sdgs_label=sdg)
    db.add(db_mustahik)
    db.commit()
    db.refresh(db_mustahik)
    return db_mustahik

@app.delete("/api/v1/mustahik/{mustahik_id}")
async def delete_mustahik(mustahik_id: str, db: Session = Depends(get_db), _ = Depends(verify_api_key)):
    mustahik = db.query(MustahikModel).filter(MustahikModel.id == mustahik_id).first()
    if not mustahik:
        raise HTTPException(status_code=404, detail="Mustahik not found")
    db.delete(mustahik)
    db.commit()
    return {"message": "Mustahik deleted successfully"}

@app.get("/api/v1/mustahiks")
async def list_mustahiks(db: Session = Depends(get_db)):
    mustahiks = db.query(MustahikModel).all()
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
async def get_ai_insight(db: Session = Depends(get_db)):
    mustahiks = await list_mustahiks(db)
    if not mustahiks:
        return {"insight": "Belum ada data untuk dianalisis."}
    
    insight = await ai_advisor.analyze_mustahik_priority(mustahiks)
    return {"insight": insight}

@app.get("/api/v1/track/{donation_id}")
async def track_donation(donation_id: str, db: Session = Depends(get_db)):
    return {
        "donation_id": donation_id,
        "status": "Tersalurkan",
        "mustahik_name": "Pak Ahmad (Anonymized)",
        "location": {"lat": -0.502, "lng": 117.153},
        "description": "Dana disalurkan untuk bantuan sembako dan modal usaha."
    }
