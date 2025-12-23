from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from typing import List, Optional
from db import get_db
from models.user import User, Role, RoleEnroll
from schemas.user import UserCreate, UserResponse, UserUpdate, RoleCreate, RoleResponse, RoleEnrollCreate, RoleEnrollResponse
from utils.security import hash_password
from datetime import datetime

router = APIRouter(prefix="/users", tags=["users"])


@router.post("", response_model=UserResponse, status_code=201)
async def create_user(user_data: UserCreate, db: AsyncSession = Depends(get_db)):
    existing = await db.execute(select(User).where(User.phone == user_data.phone))
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
    await db.commit()
    await db.refresh(user)
    
    # Reload with roles (will be null for new users)
    result = await db.execute(
        select(User)
        .options(selectinload(User.roles).selectinload(RoleEnroll.role))
        .where(User.id == user.id)
    )
    user = result.scalar_one_or_none()
    return user


@router.get("", response_model=List[UserResponse])
async def list_users(
    limit: int = Query(10, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(User)
        .options(selectinload(User.roles).selectinload(RoleEnroll.role))
        .limit(limit)
        .offset(offset)
    )
    return result.scalars().all()


@router.post("/roles", response_model=RoleResponse, status_code=201)
async def create_role(role_data: RoleCreate, db: AsyncSession = Depends(get_db)):
    existing = await db.execute(select(Role).where(Role.name == role_data.name))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Role already exists")
    
    role = Role(name=role_data.name, description=role_data.description)
    db.add(role)
    await db.commit()
    await db.refresh(role)
    return role


@router.get("/roles", response_model=List[RoleResponse])
async def list_roles(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Role))
    return result.scalars().all()


@router.post("/roles/enroll", response_model=RoleEnrollResponse, status_code=201)
async def enroll_role(enroll_data: RoleEnrollCreate, db: AsyncSession = Depends(get_db)):
    existing = await db.execute(
        select(RoleEnroll).where(
            RoleEnroll.user_id == enroll_data.user_id,
            RoleEnroll.role_id == enroll_data.role_id
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="User already has this role")
    
    enroll = RoleEnroll(user_id=enroll_data.user_id, role_id=enroll_data.role_id)
    db.add(enroll)
    await db.commit()
    await db.refresh(enroll)
    return enroll


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(user_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(User)
        .options(selectinload(User.roles).selectinload(RoleEnroll.role))
        .where(User.id == user_id)
    )
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    # Debug: Print role information
    print(f"User {user.id} roles: {user.roles}")
    if user.roles:
        for role_enroll in user.roles:
            print(f"  RoleEnroll ID: {role_enroll.id}, Role: {getattr(role_enroll, 'role', None)}")
    return user


@router.patch("/{user_id}", response_model=UserResponse)
async def update_user(user_id: int, user_data: UserUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    update_data = user_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(user, field, value)
    
    await db.commit()
    await db.refresh(user)
    
    # Reload with roles
    result = await db.execute(
        select(User)
        .options(selectinload(User.roles).selectinload(RoleEnroll.role))
        .where(User.id == user_id)
    )
    user = result.scalar_one_or_none()
    return user


@router.delete("/{user_id}", status_code=204)
async def delete_user(user_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    await db.delete(user)
    await db.commit()

