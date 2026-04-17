from sqlalchemy.orm import Session

from app.core.enums import EventStatus
from app.core.exceptions import BadRequestException, ConflictException, NotFoundException
from app.models.registration import EventRegistration
from app.models.user import User
from app.repositories.event_repository import EventRepository
from app.repositories.registration_repository import RegistrationRepository
from app.schemas.event import EventResponse
from app.schemas.registration import RegistrationMessage


class RegistrationService:
    def __init__(self, db: Session):
        self.db = db
        self.registration_repo = RegistrationRepository(db)
        self.event_repo = EventRepository(db)

    def register_to_event(self, event_id: str, user: User) -> RegistrationMessage:
        event = self.event_repo.get_by_id(event_id)
        if not event:
            raise NotFoundException(detail="Evento no encontrado")

        if event.status == EventStatus.CANCELLED.value:
            raise BadRequestException(detail="No se puede registrar a un evento cancelado")

        if event.status == EventStatus.COMPLETED.value:
            raise BadRequestException(detail="No se puede registrar a un evento completado")

        existing = self.registration_repo.get_by_user_and_event(user.id, event_id)
        if existing:
            raise ConflictException(detail="Ya estás registrado en este evento")

        if event.current_attendees >= event.capacity:
            raise ConflictException(detail="El evento está lleno")

        new_registration = EventRegistration(
            user_id=user.id,
            event_id=event_id,
        )

        self.registration_repo.create(new_registration)
        
        event.current_attendees += 1
        self.event_repo.update(event)

        return RegistrationMessage(
            message="Registro exitoso",
            event_id=event_id
        )

    def unregister_from_event(self, event_id: str, user: User) -> RegistrationMessage:
        event = self.event_repo.get_by_id(event_id)
        if not event:
            raise NotFoundException(detail="Evento no encontrado")

        registration = self.registration_repo.get_by_user_and_event(user.id, event_id)
        if not registration:
            raise NotFoundException(detail="No estás registrado en este evento")

        self.registration_repo.delete(registration)
        
        event.current_attendees -= 1
        self.event_repo.update(event)

        return RegistrationMessage(
            message="Registro cancelado exitosamente",
            event_id=event_id
        )

    def get_user_events(self, user: User) -> list[EventResponse]:
        registrations = self.registration_repo.get_by_user(user.id)
        events = [reg.event for reg in registrations]
        return [EventResponse.model_validate(event) for event in events]
