from sqlalchemy.orm import Session

from app.core.exceptions import ConflictException, UnauthorizedException
from app.core.security import create_access_token, get_password_hash, verify_password
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.schemas.user import Token, UserCreate, UserResponse


class AuthService:
    def __init__(self, db: Session):
        self.db = db
        self.user_repo = UserRepository(db)

    def register(self, user_data: UserCreate) -> UserResponse:
        existing_user = self.user_repo.get_by_email(user_data.email)
        if existing_user:
            raise ConflictException(detail="El correo electrónico ya está registrado")

        hashed_password = get_password_hash(user_data.password)
        new_user = User(
            email=user_data.email,
            full_name=user_data.full_name,
            hashed_password=hashed_password,
        )

        created_user = self.user_repo.create(new_user)
        return UserResponse.model_validate(created_user)

    def login(self, email: str, password: str) -> Token:
        user = self.user_repo.get_by_email(email)
        if not user or not verify_password(password, user.hashed_password):
            raise UnauthorizedException(detail="Correo electrónico o contraseña incorrectos")

        if not user.is_active:
            raise UnauthorizedException(detail="Usuario inactivo")

        access_token = create_access_token(data={"sub": user.id, "role": user.role})
        return Token(access_token=access_token)

    def request_password_reset(self, email: str) -> dict:
        user = self.user_repo.get_by_email(email)
        if not user:
            # Don't reveal if email exists for security
            return {"message": "Si el correo existe, recibirás un enlace de recuperación"}

        # Generate reset token (valid for 1 hour)
        reset_token = create_access_token(
            data={"sub": user.id, "type": "password_reset"},
            expires_minutes=60
        )

        # TODO: Send email with reset link
        # For now, just return success message
        # In production, you would send an email here with the reset_token
        
        return {"message": "Si el correo existe, recibirás un enlace de recuperación"}

    def reset_password(self, token: str, new_password: str) -> dict:
        from app.core.security import verify_token
        
        payload = verify_token(token)
        if not payload or payload.get("type") != "password_reset":
            raise UnauthorizedException(detail="Token inválido o expirado")

        user_id = payload.get("sub")
        user = self.user_repo.get_by_id(user_id)
        if not user:
            raise UnauthorizedException(detail="Usuario no encontrado")

        # Update password
        user.hashed_password = get_password_hash(new_password)
        self.user_repo.update(user)

        return {"message": "Contraseña actualizada exitosamente"}
