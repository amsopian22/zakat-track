import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from ai_engine.database import Base

class MustahikModel(Base):
    __tablename__ = "mustahiks"
    id = Column(String, primary_key=True, index=True)
    nim = Column(String, unique=True, index=True)
    name = Column(String, nullable=False)
    nik = Column(String, unique=True, index=True)
    address = Column(Text)
    lat = Column(Float)
    lng = Column(Float)
    
    # SAW Criteria
    income = Column(Float, default=0)         # C1
    dependents = Column(Integer, default=0)   # C2
    assets = Column(Float, default=0)         # C3
    house_status = Column(Integer, default=2) # C4 (1: Sewa, 2: Milik)
    utility_exp = Column(Float, default=0)    # C5
    health_status = Column(Integer, default=1)# C6 (1: Sehat, 2: Sakit)
    
    # Extra BPS-style variables
    education = Column(String)
    employment = Column(String)
    water_source = Column(String)
    floor_material = Column(String)
    wall_material = Column(String)
    
    # Meta
    asnaf_category = Column(String)
    priority_score = Column(Float)
    sdgs_label = Column(String)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class DonationModel(Base):
    __tablename__ = "donations"
    id = Column(String, primary_key=True, index=True)
    muzakki_name = Column(String)
    amount = Column(Float)
    mustahik_id = Column(String, ForeignKey("mustahiks.id"))
    transaction_type = Column(String, default="IN") # IN (Donation), OUT (Disbursement)
    status = Column(String, default="PENDING") # PENDING, DISBURSED
    sdgs_goal = Column(String)
    transaction_date = Column(DateTime, default=datetime.datetime.utcnow)
    qr_code_hash = Column(String, unique=True)
