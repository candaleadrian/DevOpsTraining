from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from math import radians, cos, sin, sqrt, atan2
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Proximity Alarm API", version="0.1.0")

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

class LocationData(BaseModel):
    latitude: float
    longitude: float
    radius: float

class UserLocation(BaseModel):
    latitude: float
    longitude: float

def calculate_distance(lat1, lon1, lat2, lon2):
    R = 6371000  # Earth radius in meters
    dlat = radians(lat2 - lat1)
    dlon = radians(lon2 - lon1)
    a = sin(dlat / 2) ** 2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon / 2) ** 2
    c = 2 * atan2(sqrt(a), sqrt(1 - a))
    return R * c

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
