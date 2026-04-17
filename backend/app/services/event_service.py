from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.core.exceptions import BadRequestException, ForbiddenException, NotFoundException
from app.models.event import Event
from app.models.user import User
from app.repositories.event_repository import EventRepository
from app.repositories.session_repository import SessionRepository
from app.schemas.common import PaginatedResponse
from app.schemas.event import EventCreate, EventResponse, EventUpdate


class EventService:
    def __init__(self, db: Session):
        self.db = db
        self.event_repo = EventRepository(db)
        self.session_repo = SessionRepository(db)

    def create_event(self, event_data: EventCreate, user: User) -> EventResponse:
        self._validate_event_dates(event_data.start_datetime, event_data.end_datetime)
        
        if event_data.capacity < 1:
            raise BadRequestException(detail="La capacidad debe ser al menos 1")

        new_event = Event(
            title=event_data.title,
            description=event_data.description,
            location=event_data.location,
            start_datetime=event_data.start_datetime,
            end_datetime=event_data.end_datetime,
            capacity=event_data.capacity,
            status=event_data.status,
            cover_image_url=event_data.cover_image_url,
            category=event_data.category,
            tags=event_data.tags,
            organizer_id=user.id,
        )

        created_event = self.event_repo.create(new_event)
        return EventResponse.model_validate(created_event)

    def get_events(
        self, page: int = 1, size: int = 20, search: str | None = None, status: str | None = None, category: str | None = None
    ) -> PaginatedResponse[EventResponse]:
        skip = (page - 1) * size
        events = self.event_repo.get_all(skip=skip, limit=size, search=search, status=status, category=category)
        total = self.event_repo.count(search=search, status=status, category=category)
        pages = (total + size - 1) // size

        return PaginatedResponse(
            items=[EventResponse.model_validate(event) for event in events],
            total=total,
            page=page,
            size=size,
            pages=pages,
        )

    def get_event(self, event_id: str) -> EventResponse:
        event = self.event_repo.get_by_id(event_id)
        if not event:
            raise NotFoundException(detail="Evento no encontrado")
        return EventResponse.model_validate(event)

    def update_event(
        self, event_id: str, event_data: EventUpdate, user: User
    ) -> EventResponse:
        event = self.event_repo.get_by_id(event_id)
        if not event:
            raise NotFoundException(detail="Evento no encontrado")

        if event.organizer_id != user.id and user.role != "admin":
            raise ForbiddenException(detail="No tienes autorización para actualizar este evento")

        if event_data.start_datetime and event_data.end_datetime:
            self._validate_event_dates(event_data.start_datetime, event_data.end_datetime)
        elif event_data.start_datetime:
            self._validate_event_dates(event_data.start_datetime, event.end_datetime)
        elif event_data.end_datetime:
            self._validate_event_dates(event.start_datetime, event_data.end_datetime)

        if event_data.capacity is not None and event_data.capacity < 1:
            raise BadRequestException(detail="La capacidad debe ser al menos 1")

        # Validate that new capacity is not less than max session capacity
        if event_data.capacity is not None:
            sessions = self.session_repo.get_by_event(event_id)
            if sessions:
                max_session_capacity = max(session.capacity for session in sessions)
                if event_data.capacity < max_session_capacity:
                    raise BadRequestException(
                        detail=f"No puedes reducir la capacidad a {event_data.capacity} porque tienes sesiones con capacidad de hasta {max_session_capacity}. Ajusta las sesiones primero."
                    )

        update_data = event_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(event, field, value)

        updated_event = self.event_repo.update(event)
        return EventResponse.model_validate(updated_event)

    def delete_event(self, event_id: str, user: User) -> None:
        event = self.event_repo.get_by_id(event_id)
        if not event:
            raise NotFoundException(detail="Evento no encontrado")

        if event.organizer_id != user.id and user.role != "admin":
            raise ForbiddenException(detail="No tienes autorización para eliminar este evento")

        # Prevent deletion if there are registered attendees
        if event.current_attendees > 0:
            raise BadRequestException(
                detail=f"No puedes eliminar un evento con {event.current_attendees} asistente(s) registrado(s). "
                       "Considera cambiar el estado a 'cancelled' en su lugar."
            )

        self.event_repo.delete(event)

    def _validate_event_dates(self, start: datetime, end: datetime) -> None:
        if start >= end:
            raise BadRequestException(detail="La fecha de inicio debe ser anterior a la fecha de fin")
        
        # Validate minimum duration of 30 minutes
        duration_minutes = (end - start).total_seconds() / 60
        if duration_minutes < 30:
            raise BadRequestException(detail="El evento debe durar al menos 30 minutos")
        
        # Hacer que la fecha actual sea timezone-aware para comparar
        now = datetime.now(timezone.utc)
        
        # Si start no tiene timezone, asumimos UTC
        start_aware = start if start.tzinfo else start.replace(tzinfo=timezone.utc)
        
        if start_aware < now:
            raise BadRequestException(detail="No se pueden crear eventos en el pasado")
