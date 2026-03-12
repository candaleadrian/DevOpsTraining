from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey
from datetime import datetime, timezone
from src.db.database import Base


class AlarmEvent(Base):
    __tablename__ = "alarm_events"

    id = Column(Integer, primary_key=True, index=True)
    zone_id = Column(Integer, ForeignKey("alarm_zones.id", ondelete="SET NULL"), nullable=True)
    zone_name = Column(String(255), nullable=False)
    event_type = Column(String(20), nullable=False)  # "entered" or "exited"
    distance_meters = Column(Float, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    triggered_at = Column(DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))
