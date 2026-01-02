from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from db import get_db
from models.user import User, Role
from utils.security import decode_token
from typing import List, Optional

security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    token = credentials.credentials
    payload = decode_token(token)

    if not payload or payload.get("type") != "access":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials"
        )

    user_id_str = payload.get("sub")
    if not user_id_str:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload"
        )
    user_id = int(user_id_str)
    result = db.execute(
        select(User).options(selectinload(User.roles)).where(User.id == user_id)
    )
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User not found"
        )

    # Check if user is active (handle SQLAlchemy column)
    is_active = getattr(user, 'is_active', False)
    if not is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive"
        )

    return user


def get_role_names(user: User) -> List[str]:
    """Extract role names from user roles"""
    return [role_enroll.role.name for role_enroll in user.roles if role_enroll.role]


def has_role(user: User, required_role: str) -> bool:
    """Check if user has specific role"""
    role_names = get_role_names(user)
    return required_role in role_names


def has_any_role(user: User, required_roles: List[str]) -> bool:
    """Check if user has any of the required roles"""
    role_names = get_role_names(user)
    return any(role in role_names for role in required_roles)


async def require_admin(user: User = Depends(get_current_user)) -> User:
    """Require admin role"""
    if not has_role(user, "Admin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return user


async def require_receptionist(user: User = Depends(get_current_user)) -> User:
    """Require receptionist role"""
    if not has_role(user, "Reception"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Reception access required"
        )
    return user


async def require_technician(user: User = Depends(get_current_user)) -> User:
    """Require technician role"""
    if not has_role(user, "Technician"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Technician access required"
        )
    return user


async def require_accountant(user: User = Depends(get_current_user)) -> User:
    """Require accountant role"""
    if not has_role(user, "Accountant"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Accountant access required"
        )
    return user


async def require_customer(user: User = Depends(get_current_user)) -> User:
    """Require customer role"""
    if not has_role(user, "Customer"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Customer access required"
        )
    return user


async def require_admin_or_receptionist(user: User = Depends(get_current_user)) -> User:
    """Require admin or receptionist role"""
    if not has_any_role(user, ["Admin", "Reception"]):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin or Reception access required"
        )
    return user


async def require_admin_or_accountant(user: User = Depends(get_current_user)) -> User:
    """Require admin or accountant role"""
    if not has_any_role(user, ["Admin", "Accountant"]):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin or Accountant access required"
        )
    return user


async def require_admin_or_technician(user: User = Depends(get_current_user)) -> User:
    """Require admin or technician role"""
    if not has_any_role(user, ["Admin", "Technician"]):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin or Technician access required"
        )
    return user


async def require_staff_or_customer(user: User = Depends(get_current_user)) -> User:
    """Require any staff role or customer"""
    if not has_any_role(user, ["Admin", "Reception", "Technician", "Accountant", "Customer"]):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    return user

