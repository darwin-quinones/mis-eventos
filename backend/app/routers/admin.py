from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user, require_role
from app.models.user import User
from app.schemas.common import PaginatedResponse
from app.schemas.user import UserResponse, UserUpdate
from app.services.admin_service import AdminService

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/users", response_model=PaginatedResponse[UserResponse])
def list_users(
    current_user: Annotated[User, Depends(require_role("admin"))],
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    admin_service = AdminService(db)
    return admin_service.get_users(page=page, size=size)


@router.put("/users/{user_id}", response_model=UserResponse)
def update_user(
    user_id: str,
    user_data: UserUpdate,
    current_user: Annotated[User, Depends(require_role("admin"))],
    db: Session = Depends(get_db),
):
    admin_service = AdminService(db)
    return admin_service.update_user(user_id, user_data)


@router.delete("/users/{user_id}", status_code=204)
def delete_user(
    user_id: str,
    current_user: Annotated[User, Depends(require_role("admin"))],
    db: Session = Depends(get_db),
):
    admin_service = AdminService(db)
    admin_service.delete_user(user_id, current_user)
