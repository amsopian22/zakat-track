from pydantic import BaseModel, field_validator, Field, ConfigDict
from typing import Optional
from datetime import datetime

class MustahikCreate(BaseModel):
    id: Optional[str] = None
    nim: Optional[str] = None
    name: str = Field(..., min_length=2)
    nik: str = Field(..., min_length=16, max_length=16)
    address: str
    lat: Optional[float] = -0.4948
    lng: Optional[float] = 117.1436
    income: float = Field(..., ge=0, description="Pendapatan bulanan tidak boleh negatif")
    dependents: int = Field(..., ge=1, description="Minimal 1 tanggungan (termasuk diri sendiri)")
    assets: float = Field(..., ge=0)
    house_status: int = Field(..., ge=1, le=2) # 1: Sewa, 2: Milik
    utility_exp: float = Field(..., ge=0)
    health_status: int = Field(..., ge=1, le=2) # 1: Sehat, 2: Sakit
    education: Optional[str] = None
    employment: Optional[str] = None
    water_source: Optional[str] = None
    floor_material: Optional[str] = None
    wall_material: Optional[str] = None

    @field_validator('lat')
    @classmethod
    def validate_latitude(cls, v):
        if v is not None and (v < -90 or v > 90):
            raise ValueError('Latitude must be between -90 and 90')
        return v

    @field_validator('lng')
    @classmethod
    def validate_longitude(cls, v):
        if v is not None and (v < -180 or v > 180):
            raise ValueError('Longitude must be between -180 and 180')
        return v

class MustahikRead(MustahikCreate):
    asnaf_category: Optional[str] = None
    priority_score: Optional[float] = None
    sdgs_label: Optional[str] = None
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class DonationCreate(BaseModel):
    muzakki_name: str = Field(..., min_length=2)
    amount: float = Field(..., ge=1000)
    sdgs_goal: Optional[str] = "SDG 1: No Poverty"

class DonationDisburse(BaseModel):
    mustahik_id: str
    donation_id: str

class DonationRead(DonationCreate):
    id: str
    mustahik_id: Optional[str] = None
    transaction_type: str
    status: str
    transaction_date: datetime
    qr_code_hash: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)
