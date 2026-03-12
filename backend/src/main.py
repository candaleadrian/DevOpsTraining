from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel, Field
from math import radians, cos, sin, sqrt, atan2
from typing import List, Optional
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import datetime, timezone

from src.db.database import engine, get_db, Base
from src.models.alarm_zone import AlarmZone

app = FastAPI(title="Proximity Alarm API", version="0.2.0")

# Allow the Expo development server to call the backend during local development.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8081",
        "http://127.0.0.1:8081",
        "http://localhost:19006",
        "http://127.0.0.1:19006",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Pydantic schemas
# ---------------------------------------------------------------------------

class AlarmZoneCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    radius_meters: int = Field(500, ge=50, le=100_000)


class AlarmZoneUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    latitude: Optional[float] = Field(None, ge=-90, le=90)
    longitude: Optional[float] = Field(None, ge=-180, le=180)
    radius_meters: Optional[int] = Field(None, ge=50, le=100_000)
    is_active: Optional[bool] = None


class AlarmZoneOut(BaseModel):
    id: int
    name: str
    latitude: float
    longitude: float
    radius_meters: int
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class LocationData(BaseModel):
    latitude: float
    longitude: float
    radius: float


class UserLocation(BaseModel):
    latitude: float
    longitude: float


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def calculate_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371000  # Earth radius in meters
    dlat = radians(lat2 - lat1)
    dlon = radians(lon2 - lon1)
    a = sin(dlat / 2) ** 2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon / 2) ** 2
    c = 2 * atan2(sqrt(a), sqrt(1 - a))
    return R * c


# ---------------------------------------------------------------------------
# Alarm Zones CRUD
# ---------------------------------------------------------------------------

@app.post("/api/zones", response_model=AlarmZoneOut, status_code=201)
def create_zone(zone: AlarmZoneCreate, db: Session = Depends(get_db)):
    db_zone = AlarmZone(
        name=zone.name,
        latitude=zone.latitude,
        longitude=zone.longitude,
        radius_meters=zone.radius_meters,
    )
    db.add(db_zone)
    db.commit()
    db.refresh(db_zone)
    return db_zone


@app.get("/api/zones", response_model=List[AlarmZoneOut])
def list_zones(db: Session = Depends(get_db)):
    return db.query(AlarmZone).order_by(AlarmZone.created_at.desc()).all()


@app.get("/api/zones/{zone_id}", response_model=AlarmZoneOut)
def get_zone(zone_id: int, db: Session = Depends(get_db)):
    zone = db.query(AlarmZone).filter(AlarmZone.id == zone_id).first()
    if not zone:
        raise HTTPException(status_code=404, detail="Zone not found")
    return zone


@app.patch("/api/zones/{zone_id}", response_model=AlarmZoneOut)
def update_zone(zone_id: int, updates: AlarmZoneUpdate, db: Session = Depends(get_db)):
    zone = db.query(AlarmZone).filter(AlarmZone.id == zone_id).first()
    if not zone:
        raise HTTPException(status_code=404, detail="Zone not found")
    for field, value in updates.model_dump(exclude_unset=True).items():
        setattr(zone, field, value)
    zone.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(zone)
    return zone


@app.delete("/api/zones/{zone_id}", status_code=204)
def delete_zone(zone_id: int, db: Session = Depends(get_db)):
    zone = db.query(AlarmZone).filter(AlarmZone.id == zone_id).first()
    if not zone:
        raise HTTPException(status_code=404, detail="Zone not found")
    db.delete(zone)
    db.commit()


# ---------------------------------------------------------------------------
# Check proximity against ALL active zones
# ---------------------------------------------------------------------------

@app.post("/api/zones/check")
def check_zones(user_location: UserLocation, db: Session = Depends(get_db)):
    zones = db.query(AlarmZone).filter(AlarmZone.is_active).all()
    results = []
    for z in zones:
        d = calculate_distance(z.latitude, z.longitude, user_location.latitude, user_location.longitude)
        results.append({
            "zone_id": z.id,
            "name": z.name,
            "distance": round(d, 1),
            "alarm": d <= z.radius_meters,
        })
    return results


# ---------------------------------------------------------------------------
# Legacy endpoints (keep for backwards compatibility)
# ---------------------------------------------------------------------------

selected_location = None


@app.post("/set-location")
async def set_location(location: LocationData):
    global selected_location
    selected_location = location
    return {"message": "Location and radius set successfully"}


@app.post("/check-location")
async def check_location(user_location: UserLocation):
    if not selected_location:
        raise HTTPException(status_code=400, detail="No location set")

    distance = calculate_distance(
        selected_location.latitude,
        selected_location.longitude,
        user_location.latitude,
        user_location.longitude,
    )

    if distance <= selected_location.radius:
        return {"alarm": True, "distance": distance}
    return {"alarm": False, "distance": distance}


@app.get("/")
def root():
    return {"message": "Hello World", "service": "proximity-alarm-api"}


@app.get("/health")
async def health_check():
    return {"status": "ok"}
