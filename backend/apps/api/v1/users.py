from fastapi import APIRouter, HTTPException, Depends, Query
from utils.dependencies import require_admin, require_staff_or_customer, get_current_user, require_admin_or_receptionist, require_admin_or_technician
from sqlalchemy.orm import Session
from sqlalchemy import select, func, or_
from sqlalchemy.orm import selectinload
from typing import List, Optional
from db import get_db
from models.user import User, Role, RoleEnroll
from schemas.user import UserCreate, UserResponse, UserUpdate, RoleCreate, RoleResponse, RoleEnrollCreate, RoleEnrollResponse, UserListResponse, RoleUpdate
from utils.security import hash_password
from datetime import datetime

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/customers", response_model=UserListResponse)
async def list_customers(
    limit: int = Query(100, ge=1, le=100),
    offset: int = Query(0, ge=0),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get list of customers. Accessible by all authenticated users.
    Receptionists and technicians need this to assign customers to orders.
    """
    try:
        # Get total count of customers
        count_query = (
            select(func.count())
            .select_from(User)
            .join(User.roles)
            .join(RoleEnroll.role)
            .where(Role.name == "Customer")
        )
        count_result = db.execute(count_query)
        total = count_result.scalar()

        # Get customer items
        query = (
            select(User)
            .options(selectinload(User.roles).selectinload(RoleEnroll.role))
            .join(User.roles)
            .join(RoleEnroll.role)
            .where(Role.name == "Customer")
            .limit(limit)
            .offset(offset)
        )
        
        result = db.execute(query)
        items = result.scalars().all()
        
        return {
            "items": items,
            "total": total,
            "page": (offset // limit) + 1,
            "limit": limit
        }
    except Exception as e:
        import traceback
        error_msg = str(e)
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Database error: {error_msg[:100]}")


@router.get("/technicians", response_model=UserListResponse)
async def list_technicians(
    limit: int = Query(100, ge=1, le=100),
    offset: int = Query(0, ge=0),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get list of technicians. Accessible by all authenticated users.
    Receptionists need this to assign technicians to orders.
    """
    try:
        # Get total count of technicians
        count_query = (
            select(func.count())
            .select_from(User)
            .join(User.roles)
            .join(RoleEnroll.role)
            .where(Role.name == "Technician")
        )
        count_result = db.execute(count_query)
        total = count_result.scalar()

        # Get technician items
        query = (
            select(User)
            .options(selectinload(User.roles).selectinload(RoleEnroll.role))
            .join(User.roles)
            .join(RoleEnroll.role)
            .where(Role.name == "Technician")
            .limit(limit)
            .offset(offset)
        )
        
        result = db.execute(query)
        items = result.scalars().all()
        
        return {
            "items": items,
            "total": total,
            "page": (offset // limit) + 1,
            "limit": limit
        }
    except Exception as e:
        import traceback
        error_msg = str(e)
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Database error: {error_msg[:100]}")


@router.post("", response_model=UserResponse, status_code=201)
async def create_user(
    user_data: UserCreate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    existing = db.execute(select(User).where(User.phone == user_data.phone))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Phone already registered")
    
    user = User(
        full_name=user_data.full_name,
        phone=user_data.phone,
        email=user_data.email,
        password_hash=hash_password(user_data.password),
        profile_picture=user_data.profile_picture
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    # Reload with roles (will be null for new users)
    result = db.execute(
        select(User)
        .options(selectinload(User.roles).selectinload(RoleEnroll.role))
        .where(User.id == user.id)
    )
    user = result.scalar_one_or_none()
    return user


@router.get("", response_model=UserListResponse)
async def list_users(
    role_name: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    limit: int = Query(10, ge=1, le=100),
    offset: int = Query(0, ge=0),
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    try:
        # Build base query
        base_filters = []
        
        # Add search filter if provided
        if search:
            search_term = f"%{search}%"
            base_filters.append(
                or_(
                    User.full_name.ilike(search_term),
                    User.email.ilike(search_term),
                    User.phone.ilike(search_term)
                )
            )
        
        # Get total count
        count_query = select(func.count()).select_from(User)
        
        if role_name:
            count_query = count_query.join(User.roles).join(RoleEnroll.role).where(Role.name == role_name)
        
        if base_filters:
            count_query = count_query.where(*base_filters)

        count_result = db.execute(count_query)
        total = count_result.scalar()

        # Get items
        query = (
            select(User)
            .options(selectinload(User.roles).selectinload(RoleEnroll.role))
        )
        
        if role_name:
            query = query.join(User.roles).join(RoleEnroll.role).where(Role.name == role_name)
        
        if base_filters:
            query = query.where(*base_filters)
            
        query = query.limit(limit).offset(offset)
        
        result = db.execute(query)
        items = result.scalars().all()
        
        return {
            "items": items,
            "total": total,
            "page": (offset // limit) + 1,
            "limit": limit
        }
    except Exception as e:
        import traceback
        error_msg = str(e)
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Database error: {error_msg[:100]}")


@router.post("/roles", response_model=RoleResponse, status_code=201)
async def create_role(
    data: RoleCreate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    existing = db.execute(select(Role).where(Role.name == data.name))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Role already exists")
    
    role = Role(name=data.name, description=data.description)
    db.add(role)
    db.commit()
    db.refresh(role)
    return role


@router.get("/roles", response_model=List[RoleResponse])
async def list_roles(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    result = db.execute(select(Role))
    return result.scalars().all()


@router.get("/roles/{role_id}", response_model=RoleResponse)
async def get_role(
    role_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    result = db.execute(select(Role).where(Role.id == role_id))
    role = result.scalar_one_or_none()
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    return role


@router.patch("/roles/{role_id}", response_model=RoleResponse)
async def update_role(
    role_id: int,
    data: RoleUpdate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    result = db.execute(select(Role).where(Role.id == role_id))
    role = result.scalar_one_or_none()
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    
    update_data = data.model_dump(exclude_unset=True)
    if "name" in update_data and update_data["name"] != role.name:
        existing = db.execute(select(Role).where(Role.name == update_data["name"]))
        if existing.scalar_one_or_none():
            raise HTTPException(status_code=400, detail="Role name already exists")
    
    for field, value in update_data.items():
        setattr(role, field, value)
    
    db.commit()
    db.refresh(role)
    return role


@router.post("/roles/enroll", response_model=RoleEnrollResponse, status_code=201)
async def enroll_role(
    data: RoleEnrollCreate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    existing = db.execute(
        select(RoleEnroll).where(
            RoleEnroll.user_id == data.user_id,
            RoleEnroll.role_id == data.role_id
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="User already has this role")

    user = db.execute(select(User).where(User.id == data.user_id))
    if not user.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="User not found")

    role = db.execute(select(Role).where(Role.id == data.role_id))
    if not role.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Role not found")

    enroll = RoleEnroll(user_id=data.user_id, role_id=data.role_id)
    db.add(enroll)
    db.commit()
    db.refresh(enroll)
    return enroll


@router.delete("/roles/{role_id}", status_code=204)
async def delete_role(
    role_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    result = db.execute(select(Role).where(Role.id == role_id))
    role = result.scalar_one_or_none()
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    
    db.delete(role)
    db.commit()


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: int,
    current_user: User = Depends(require_staff_or_customer),
    db: Session = Depends(get_db)
):
    result = db.execute(
        select(User)
        .options(selectinload(User.roles).selectinload(RoleEnroll.role))
        .where(User.id == user_id)
    )
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.patch("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: int,
    user_data: UserUpdate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    result = db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    update_data = user_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(user, field, value)
    
    db.commit()
    db.refresh(user)
    
    # Reload with roles
    result = db.execute(
        select(User)
        .options(selectinload(User.roles).selectinload(RoleEnroll.role))
        .where(User.id == user_id)
    )
    user = result.scalar_one_or_none()
    return user


@router.delete("/{user_id}", status_code=204)
async def delete_user(
    user_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    result = db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(user)
    db.commit()


@router.post("/{user_id}/roles", response_model=RoleEnrollResponse, status_code=201)
async def assign_role(
    user_id: int,
    data: RoleEnrollCreate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    if user_id != data.user_id:
         raise HTTPException(status_code=400, detail="User ID mismatch")

    user = db.execute(select(User).where(User.id == user_id))
    if not user.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="User not found")
    
    role = db.execute(select(Role).where(Role.id == data.role_id))
    if not role.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Role not found")
    
    existing = db.execute(
        select(RoleEnroll).where(
            RoleEnroll.user_id == user_id,
            RoleEnroll.role_id == data.role_id
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Role already assigned to this user")
    
    enroll = RoleEnroll(user_id=user_id, role_id=data.role_id)
    db.add(enroll)
    db.commit()
    db.refresh(enroll)
    return enroll


@router.delete("/{user_id}/roles/{role_id}", status_code=204)
async def remove_role(
    user_id: int,
    role_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    result = db.execute(
        select(RoleEnroll).where(
            RoleEnroll.user_id == user_id,
            RoleEnroll.role_id == role_id
        )
    )
    enroll = result.scalar_one_or_none()
    if not enroll:
        raise HTTPException(status_code=404, detail="Role assignment not found")
    
    db.delete(enroll)
    db.commit()
