from pydantic import BaseModel, field_validator, Field
from typing import Optional

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
    created_at: Optional[str] = None # Or datetime if handled

    class Config:
        from_attributes = True
