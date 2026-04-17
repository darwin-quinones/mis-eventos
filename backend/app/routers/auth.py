from typing import Annotated

from fastapi import APIRouter, Depends, Form
from sqlalchemy.orm import Session

from app.dependencies import get_current_user
from app.database import get_db
from app.models.user import User
from app.schemas.user import MessageResponse, PasswordReset, PasswordResetRequest, Token, UserCreate, UserResponse
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=UserResponse, status_code=201)
def register(
    user_data: UserCreate,
    db: Session = Depends(get_db),
):
    auth_service = AuthService(db)
    return auth_service.register(user_data)


@router.post("/login", response_model=Token)
def login(
    email: str = Form(...),
    password: str = Form(...),
    db: Session = Depends(get_db),
):
    auth_service = AuthService(db)
    return auth_service.login(email, password)


@router.get("/me", response_model=UserResponse)
def get_current_user_info(
    current_user: Annotated[User, Depends(get_current_user)],
):
    return UserResponse.model_validate(current_user)



@router.post("/forgot-password", response_model=MessageResponse)
def forgot_password(
    request_data: PasswordResetRequest,
    db: Session = Depends(get_db),
):
    auth_service = AuthService(db)
    result = auth_service.request_password_reset(request_data.email)
    return result


@router.post("/reset-password", response_model=MessageResponse)
def reset_password(
    reset_data: PasswordReset,
    db: Session = Depends(get_db),
):
    auth_service = AuthService(db)
    result = auth_service.reset_password(reset_data.token, reset_data.new_password)
    return result
