from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class EventBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: str = Field(..., min_length=1)
    location: str = Field(..., min_length=1, max_length=200)
    start_datetime: datetime
    end_datetime: datetime
    capacity: int = Field(..., ge=1)
    status: str = "draft"
    cover_image_url: str | None = None
    category: str | None = None
    tags: str | None = None


class EventCreate(EventBase):
    pass


class EventUpdate(BaseModel):
    title: str | None = Field(None, min_length=1, max_length=200)
    description: str | None = Field(None, min_length=1)
    location: str | None = Field(None, min_length=1, max_length=200)
    start_datetime: datetime | None = None
    end_datetime: datetime | None = None
    capacity: int | None = Field(None, ge=1)
    status: str | None = None
    cover_image_url: str | None = None
    category: str | None = None
    tags: str | None = None


class EventResponse(EventBase):
    id: UUID
    current_attendees: int
    organizer_id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
