from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class SessionBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: str = Field(..., min_length=1)
    speaker_name: str = Field(..., min_length=1, max_length=100)
    speaker_bio: str | None = None
    speaker_photo_url: str | None = None
    start_time: datetime
    end_time: datetime
    capacity: int = Field(..., ge=1)


class SessionCreate(SessionBase):
    pass


class SessionUpdate(BaseModel):
    title: str | None = Field(None, min_length=1, max_length=200)
    description: str | None = Field(None, min_length=1)
    speaker_name: str | None = Field(None, min_length=1, max_length=100)
    speaker_bio: str | None = None
    speaker_photo_url: str | None = None
    start_time: datetime | None = None
    end_time: datetime | None = None
    capacity: int | None = Field(None, ge=1)


class SessionResponse(SessionBase):
    id: UUID
    event_id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
