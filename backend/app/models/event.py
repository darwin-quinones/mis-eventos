import uuid
from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from app.core.enums import EventStatus
from app.database import Base


class Event(Base):
    __tablename__ = "events"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String, nullable=False, index=True)
    description = Column(Text, nullable=False)
    location = Column(String, nullable=False)
    start_datetime = Column(DateTime, nullable=False)
    end_datetime = Column(DateTime, nullable=False)
    capacity = Column(Integer, nullable=False)
    current_attendees = Column(Integer, default=0, nullable=False)
    status = Column(String, default=EventStatus.DRAFT.value, nullable=False)
    cover_image_url = Column(String, nullable=True)
    category = Column(String, nullable=True)
    tags = Column(String, nullable=True)  # Stored as comma-separated values
    organizer_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    organizer = relationship("User", back_populates="events")
    sessions = relationship("Session", back_populates="event", cascade="all, delete")
    registrations = relationship(
        "EventRegistration", back_populates="event", cascade="all, delete"
    )
