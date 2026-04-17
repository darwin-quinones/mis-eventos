from typing import Annotated

from fastapi import Depends, Header
from sqlalchemy.orm import Session

from app.core.exceptions import ForbiddenException, UnauthorizedException
from app.core.security import decode_access_token
from app.database import get_db
from app.models.user import User
from app.repositories.user_repository import UserRepository


def get_current_user(
    authorization: Annotated[str | None, Header()] = None,
    db: Session = Depends(get_db),
) -> User:
    if not authorization or not authorization.startswith("Bearer "):
        raise UnauthorizedException(detail="Token faltante o inválido")

    token = authorization.replace("Bearer ", "")
    payload = decode_access_token(token)
    user_id: str | None = payload.get("sub")

    if user_id is None:
        raise UnauthorizedException(detail="Token inválido")

    user_repo = UserRepository(db)
    user = user_repo.get_by_id(user_id)

    if user is None:
        raise UnauthorizedException(detail="Usuario no encontrado")

    if not user.is_active:
        raise ForbiddenException(detail="Usuario inactivo")

    return user


def require_role(role: str):
    """Require exact role match"""
    def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role != role:
            raise ForbiddenException(
                detail=f"Se requiere rol de {role}"
            )
        return current_user

    return role_checker


def require_organizer_or_admin(current_user: User = Depends(get_current_user)) -> User:
    """Require user to be Organizador or Admin"""
    if current_user.role not in ["organizador", "admin"]:
        raise ForbiddenException(
            detail="Se requiere rol de Organizador o Administrador para crear eventos"
        )
    return current_user


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    """Require user to be Admin"""
    if current_user.role != "admin":
        raise ForbiddenException(
            detail="Se requiere rol de Administrador"
        )
    return current_user
