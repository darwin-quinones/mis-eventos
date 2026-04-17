import uuid
from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, String, UniqueConstraint
from sqlalchemy.orm import relationship

from app.database import Base


class EventRegistration(Base):
    __tablename__ = "event_registrations"
    __table_args__ = (UniqueConstraint("user_id", "event_id", name="uq_user_event"),)

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    event_id = Column(String(36), ForeignKey("events.id"), nullable=False)
    registered_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="registrations")
    event = relationship("Event", back_populates="registrations")
