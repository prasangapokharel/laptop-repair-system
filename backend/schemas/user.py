from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional, List, Any
from datetime import datetime


class UserCreate(BaseModel):
    full_name: str
    phone: str
    email: Optional[EmailStr] = None
    password: str
    profile_picture: Optional[str] = None


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    profile_picture: Optional[str] = None
    is_active: Optional[bool] = None


class RoleResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class UserResponse(BaseModel):
    id: int
    full_name: str
    phone: str
    email: Optional[str]
    profile_picture: Optional[str]
    is_active: bool
    is_staff: bool
    created_at: datetime
    role: Optional[RoleResponse] = None

    @field_validator('role', mode='before')
    @classmethod
    def extract_role(cls, v: Any) -> Optional[Any]:
        """Extract primary Role object from RoleEnroll relationships"""
        if isinstance(v, list):
            # If it's a list of RoleEnroll objects, get the first role
            if v and hasattr(v[0], 'role'):
                # Return only the first role as the primary role
                return v[0].role if v[0].role else None
            # If it's already a list of roles, return the first one
            return v[0] if v else None
        elif hasattr(v, 'role'):  # If it's a single RoleEnroll object
            return v.role if v.role else None
        return v

    class Config:
        from_attributes = True


class RoleCreate(BaseModel):
    name: str
    description: Optional[str] = None


class RoleEnrollCreate(BaseModel):
    user_id: int
    role_id: int


class RoleEnrollResponse(BaseModel):
    id: int
    user_id: int
    role_id: int
    created_at: datetime

    class Config:
        from_attributes = True

