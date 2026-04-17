from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class RegistrationResponse(BaseModel):
    id: UUID
    user_id: UUID
    event_id: UUID
    registered_at: datetime

    model_config = ConfigDict(from_attributes=True)


class RegistrationMessage(BaseModel):
    message: str
    event_id: UUID
