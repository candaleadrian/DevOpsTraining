import os
import logging
import re

from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from math import radians, cos, sin, sqrt, atan2
from typing import List, Optional
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import datetime, timezone

from src.db.database import get_db
from src.models.alarm_zone import AlarmZone
from src.models.alarm_event import AlarmEvent
from src.models.user import User
from src.auth import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user,
    require_user,
)
from prometheus_fastapi_instrumentator import Instrumentator

logger = logging.getLogger(__name__)

app = FastAPI(title="Proximity Alarm API", version="0.2.0")

# Allow the Expo development server and Azure Container Apps to call the backend.
_cors_origins = [
    "http://localhost:8081",
    "http://127.0.0.1:8081",
    "http://localhost:19006",
    "http://127.0.0.1:19006",
]
_extra_origin = os.environ.get("FRONTEND_URL")
if _extra_origin:
    _cors_origins.append(_extra_origin)

# Build a regex that also matches revision-specific URLs (e.g. --0000002 suffix)
# so new Container App revisions don't break CORS.
_cors_origin_regex = None
if _extra_origin:
    # e.g. https://ca-frontend-xxx.domain -> https://ca-frontend-xxx(--[a-z0-9]+)?\.domain
    escaped = re.escape(_extra_origin)
    # Insert optional revision suffix before the first dot after the app name
    _cors_origin_regex = escaped.replace(r"\.", r"(--[a-z0-9]+)?\.", 1)

app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins,
    allow_origin_regex=_cors_origin_regex,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Prometheus metrics — automatically instruments all routes.
# Creates a /metrics endpoint that Prometheus scrapes every 15 seconds.
# Tracks: request count, request duration, request size, response size.
# ---------------------------------------------------------------------------
Instrumentator().instrument(app).expose(app, endpoint="/metrics")


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error("Unhandled error on %s %s: %s", request.method, request.url.path, exc)
    return JSONResponse(status_code=500, content={"detail": "Internal server error"})


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


class AlarmEventCreate(BaseModel):
    zone_id: int
    zone_name: str = Field(..., min_length=1, max_length=255)
    event_type: str = Field(..., pattern=r"^(entered|exited)$")
    distance_meters: float = Field(..., ge=0)
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)


class AlarmEventOut(BaseModel):
    id: int
    zone_id: Optional[int]
    zone_name: str
    event_type: str
    distance_meters: float
    latitude: float
    longitude: float
    triggered_at: datetime

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
# Auth schemas
# ---------------------------------------------------------------------------


class AuthRegister(BaseModel):
    email: str = Field(..., min_length=3, max_length=255)
    password: str = Field(..., min_length=6, max_length=128)


class AuthLogin(BaseModel):
    email: str
    password: str


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict


class UserOut(BaseModel):
    id: int
    email: str
    created_at: datetime

    class Config:
        from_attributes = True


# ---------------------------------------------------------------------------
# Auth endpoints
# ---------------------------------------------------------------------------


@app.post("/auth/register", response_model=AuthResponse, status_code=201)
def register(body: AuthRegister, db: Session = Depends(get_db)):
    email = body.email.strip().lower()
    if db.query(User).filter(User.email == email).first():
        raise HTTPException(status_code=409, detail="Email already registered")
    user = User(email=email, hashed_password=hash_password(body.password))
    db.add(user)
    db.commit()
    db.refresh(user)
    token = create_access_token(user.id, user.email)
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {"id": user.id, "email": user.email},
    }


@app.post("/auth/login", response_model=AuthResponse)
def login(body: AuthLogin, db: Session = Depends(get_db)):
    email = body.email.strip().lower()
    user = db.query(User).filter(User.email == email).first()
    if not user or not verify_password(body.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_access_token(user.id, user.email)
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {"id": user.id, "email": user.email},
    }


@app.get("/auth/me", response_model=UserOut)
def get_me(user: User = Depends(require_user)):
    return user


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def calculate_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371000  # Earth radius in meters
    dlat = radians(lat2 - lat1)
    dlon = radians(lon2 - lon1)
    a = (
        sin(dlat / 2) ** 2
        + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon / 2) ** 2
    )
    c = 2 * atan2(sqrt(a), sqrt(1 - a))
    return R * c


# ---------------------------------------------------------------------------
# Alarm Zones CRUD
# ---------------------------------------------------------------------------


@app.post("/api/zones", response_model=AlarmZoneOut, status_code=201)
def create_zone(
    zone: AlarmZoneCreate,
    db: Session = Depends(get_db),
    user: User | None = Depends(get_current_user),
):
    db_zone = AlarmZone(
        name=zone.name,
        latitude=zone.latitude,
        longitude=zone.longitude,
        radius_meters=zone.radius_meters,
        user_id=user.id if user else None,
    )
    db.add(db_zone)
    db.commit()
    db.refresh(db_zone)
    return db_zone


@app.get("/api/zones", response_model=List[AlarmZoneOut])
def list_zones(
    db: Session = Depends(get_db),
    user: User | None = Depends(get_current_user),
):
    q = db.query(AlarmZone)
    if user:
        q = q.filter(AlarmZone.user_id == user.id)
    else:
        q = q.filter(AlarmZone.user_id.is_(None))
    return q.order_by(AlarmZone.created_at.desc()).all()


@app.get("/api/zones/{zone_id}", response_model=AlarmZoneOut)
def get_zone(
    zone_id: int,
    db: Session = Depends(get_db),
    user: User | None = Depends(get_current_user),
):
    q = db.query(AlarmZone).filter(AlarmZone.id == zone_id)
    if user:
        q = q.filter(AlarmZone.user_id == user.id)
    else:
        q = q.filter(AlarmZone.user_id.is_(None))
    zone = q.first()
    if not zone:
        raise HTTPException(status_code=404, detail="Zone not found")
    return zone


@app.patch("/api/zones/{zone_id}", response_model=AlarmZoneOut)
def update_zone(
    zone_id: int,
    updates: AlarmZoneUpdate,
    db: Session = Depends(get_db),
    user: User | None = Depends(get_current_user),
):
    q = db.query(AlarmZone).filter(AlarmZone.id == zone_id)
    if user:
        q = q.filter(AlarmZone.user_id == user.id)
    else:
        q = q.filter(AlarmZone.user_id.is_(None))
    zone = q.first()
    if not zone:
        raise HTTPException(status_code=404, detail="Zone not found")
    for field, value in updates.model_dump(exclude_unset=True).items():
        setattr(zone, field, value)
    zone.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(zone)
    return zone


@app.delete("/api/zones/{zone_id}", status_code=204)
def delete_zone(
    zone_id: int,
    db: Session = Depends(get_db),
    user: User | None = Depends(get_current_user),
):
    q = db.query(AlarmZone).filter(AlarmZone.id == zone_id)
    if user:
        q = q.filter(AlarmZone.user_id == user.id)
    else:
        q = q.filter(AlarmZone.user_id.is_(None))
    zone = q.first()
    if not zone:
        raise HTTPException(status_code=404, detail="Zone not found")
    db.delete(zone)
    db.commit()


# ---------------------------------------------------------------------------
# Check proximity against ALL active zones
# ---------------------------------------------------------------------------


@app.post("/api/zones/check")
def check_zones(
    user_location: UserLocation,
    db: Session = Depends(get_db),
    user: User | None = Depends(get_current_user),
):
    q = db.query(AlarmZone).filter(AlarmZone.is_active)
    if user:
        q = q.filter(AlarmZone.user_id == user.id)
    else:
        q = q.filter(AlarmZone.user_id.is_(None))
    zones = q.all()
    results = []
    for z in zones:
        d = calculate_distance(
            z.latitude, z.longitude, user_location.latitude, user_location.longitude
        )
        results.append(
            {
                "zone_id": z.id,
                "name": z.name,
                "distance": round(d, 1),
                "alarm": d <= z.radius_meters,
            }
        )
    return results


# ---------------------------------------------------------------------------
# Alarm Events (history log)
# ---------------------------------------------------------------------------


@app.post("/api/alarm-events", response_model=AlarmEventOut, status_code=201)
def create_alarm_event(
    event: AlarmEventCreate,
    db: Session = Depends(get_db),
    user: User | None = Depends(get_current_user),
):
    db_event = AlarmEvent(
        zone_id=event.zone_id,
        zone_name=event.zone_name,
        event_type=event.event_type,
        distance_meters=event.distance_meters,
        latitude=event.latitude,
        longitude=event.longitude,
        user_id=user.id if user else None,
    )
    db.add(db_event)
    db.commit()
    db.refresh(db_event)
    return db_event


@app.get("/api/alarm-events", response_model=List[AlarmEventOut])
def list_alarm_events(
    zone_id: Optional[int] = None,
    limit: int = 50,
    db: Session = Depends(get_db),
    user: User | None = Depends(get_current_user),
):
    q = db.query(AlarmEvent)
    if user:
        q = q.filter(AlarmEvent.user_id == user.id)
    else:
        q = q.filter(AlarmEvent.user_id.is_(None))
    if zone_id is not None:
        q = q.filter(AlarmEvent.zone_id == zone_id)
    return q.order_by(AlarmEvent.triggered_at.desc()).limit(min(limit, 500)).all()


@app.delete("/api/alarm-events", status_code=204)
def clear_alarm_events(
    db: Session = Depends(get_db),
    user: User | None = Depends(get_current_user),
):
    q = db.query(AlarmEvent)
    if user:
        q = q.filter(AlarmEvent.user_id == user.id)
    else:
        q = q.filter(AlarmEvent.user_id.is_(None))
    q.delete()
    db.commit()


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
