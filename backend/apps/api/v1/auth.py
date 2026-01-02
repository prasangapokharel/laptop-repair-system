from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from datetime import datetime, timedelta, timezone
from db import get_db
from models.user import User, RefreshToken, RoleEnroll, Role
from schemas.auth import RegisterRequest, LoginRequest, LoginResponse, RefreshRequest, RefreshResponse, TokenResponse
from utils.security import hash_password, verify_password, create_access_token, create_refresh_token, decode_token
from core.config import settings
from schemas.user import UserResponse, RoleResponse

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=UserResponse, status_code=201)
async def register(data: RegisterRequest, db: Session = Depends(get_db)):
    existing = db.execute(select(User).where(User.phone == data.phone))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Phone already registered")
    
    user = User(
        full_name=data.full_name,
        phone=data.phone,
        email=data.email,
        password_hash=hash_password(data.password)
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    # Reload with roles (will be empty for new users)
    result = db.execute(
        select(User)
        .options(selectinload(User.roles).selectinload(RoleEnroll.role))
        .where(User.id == user.id)
    )
    user = result.scalar_one_or_none()
    
    return user


@router.post("/login", response_model=LoginResponse)
async def login(data: LoginRequest, db: Session = Depends(get_db)):
    try:
        result = db.execute(
            select(User)
            .options(selectinload(User.roles).selectinload(RoleEnroll.role))
            .where(User.phone == data.phone)
        )
        user = result.scalar_one_or_none()
        
        if not user:
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        if not user.password_hash:
            raise HTTPException(status_code=500, detail="User password hash is missing")
        
        # Check if password hash is valid (bcrypt hashes are 60 chars)
        if len(user.password_hash) > 72:
            raise HTTPException(
                status_code=500, 
                detail="User password hash is corrupted. Please contact administrator to reset password."
            )
        
        if not verify_password(data.password, user.password_hash):
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        if not user.is_active:
            raise HTTPException(status_code=403, detail="User is inactive")
        
        access_token = create_access_token({"sub": str(user.id), "phone": user.phone})
        refresh_token = create_refresh_token({"sub": str(user.id)})
        
        expires_at = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
        token_record = RefreshToken(
            user_id=user.id,
            token=refresh_token,
            expires_at=expires_at
        )
        db.add(token_record)
        db.commit()
        
        # Build user response with roles
        user_dict = UserResponse.model_validate(user).model_dump()
        primary_role = None
        try:
            if hasattr(user, "roles") and user.roles:
                for enroll in user.roles:
                    if getattr(enroll, "role", None) and enroll.role.name == "Technician":
                        primary_role = enroll.role
                        break
                if not primary_role:
                    first = user.roles[0]
                    primary_role = getattr(first, "role", None)
        except Exception:
            primary_role = None
        user_dict["role"] = RoleResponse.model_validate(primary_role).model_dump() if primary_role else None
        
        return LoginResponse(
            user=user_dict,
            tokens=TokenResponse(access_token=access_token, refresh_token=refresh_token)
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Login failed: {str(e)}")


@router.post("/refresh", response_model=RefreshResponse)
async def refresh(data: RefreshRequest, db: Session = Depends(get_db)):
    payload = decode_token(data.refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    
    user_id = int(payload.get("sub"))
    token_record = db.execute(
        select(RefreshToken).where(
            RefreshToken.token == data.refresh_token,
            RefreshToken.user_id == user_id,
            RefreshToken.expires_at > datetime.now(timezone.utc)
        )
    )
    token = token_record.scalar_one_or_none()
    if not token:
        raise HTTPException(status_code=401, detail="Refresh token not found or expired")
    
    result = db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user or not user.is_active:
        raise HTTPException(status_code=403, detail="User not found or inactive")
    
    access_token = create_access_token({"sub": str(user.id), "phone": user.phone})
    return RefreshResponse(access_token=access_token)


@router.post("/logout", status_code=204)
async def logout(data: RefreshRequest, db: Session = Depends(get_db)):
    result = db.execute(select(RefreshToken).where(RefreshToken.token == data.refresh_token))
    token = result.scalar_one_or_none()
    if token:
        db.delete(token)
        db.commit()
