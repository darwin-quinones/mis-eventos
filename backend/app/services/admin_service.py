from sqlalchemy.orm import Session

from app.core.exceptions import BadRequestException, NotFoundException
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.schemas.common import PaginatedResponse
from app.schemas.user import UserResponse, UserUpdate


class AdminService:
    def __init__(self, db: Session):
        self.db = db
        self.user_repo = UserRepository(db)

    def get_users(self, page: int = 1, size: int = 20) -> PaginatedResponse[UserResponse]:
        skip = (page - 1) * size
        users = self.user_repo.get_all(skip=skip, limit=size)
        total = self.user_repo.count()
        pages = (total + size - 1) // size

        return PaginatedResponse(
            items=[UserResponse.model_validate(user) for user in users],
            total=total,
            page=page,
            size=size,
            pages=pages,
        )

    def update_user(self, user_id: str, user_data: UserUpdate) -> UserResponse:
        user = self.user_repo.get_by_id(user_id)
        if not user:
            raise NotFoundException(detail="Usuario no encontrado")

        # Validate role changes
        if user_data.role and user_data.role != user.role:
            current_role = user.role
            new_role = user_data.role
            
            # Define role hierarchy: asistente < organizador < admin
            role_hierarchy = {'asistente': 0, 'organizador': 1, 'admin': 2}
            
            current_level = role_hierarchy.get(current_role, 0)
            new_level = role_hierarchy.get(new_role, 0)
            
            # Only allow promotions, not degradations
            if new_level < current_level:
                raise BadRequestException(
                    detail="No se permite degradar roles. Solo se pueden hacer promociones."
                )
            
            # Asistente cannot be promoted
            if current_role == 'asistente' and new_role != 'asistente':
                raise BadRequestException(
                    detail="Los asistentes no pueden ser promovidos. Solo los organizadores pueden ser promovidos a admin."
                )
            
            # Only organizador can be promoted to admin
            if current_role == 'organizador' and new_role == 'admin':
                # This is allowed
                pass
            elif current_role != new_role and current_role != 'organizador':
                raise BadRequestException(
                    detail="Solo los organizadores pueden ser promovidos a administrador."
                )

        update_data = user_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(user, field, value)

        updated_user = self.user_repo.update(user)
        return UserResponse.model_validate(updated_user)

    def delete_user(self, user_id: str, current_user: User) -> None:
        # Prevent admin from deleting themselves
        if user_id == str(current_user.id):
            raise BadRequestException(detail="No puedes eliminar tu propia cuenta")
        
        user = self.user_repo.get_by_id(user_id)
        if not user:
            raise NotFoundException(detail="Usuario no encontrado")

        # Check if user has created events
        from app.repositories.event_repository import EventRepository
        event_repo = EventRepository(self.db)
        # Get all events and filter by organizer_id
        all_events = event_repo.get_all(skip=0, limit=1000)  # Get enough to check
        user_events = [e for e in all_events if str(e.organizer_id) == user_id]
        
        if user_events:
            raise BadRequestException(
                detail=f"No se puede eliminar este usuario porque ha creado {len(user_events)} evento(s). Elimina o reasigna sus eventos primero."
            )

        # Check if user has event registrations
        from app.repositories.registration_repository import RegistrationRepository
        registration_repo = RegistrationRepository(self.db)
        user_registrations = registration_repo.get_by_user(user.id)
        
        if user_registrations:
            raise BadRequestException(
                detail=f"No se puede eliminar este usuario porque está registrado en {len(user_registrations)} evento(s). Cancela sus registros primero."
            )

        self.user_repo.delete(user)
