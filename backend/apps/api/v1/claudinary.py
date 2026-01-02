from fastapi import APIRouter, Depends, HTTPException, File, UploadFile
from sqlalchemy.orm import Session
from sqlalchemy import select
from db import get_db
from models.user import User
from schemas.upload import UploadResponse
from utils.dependencies import get_current_user
from core.uploadhandler import upload_image
from datetime import datetime

router = APIRouter(prefix="/users", tags=["users"]) 

@router.post("/{name}/profilepic", response_model=UploadResponse)
async def upload_profile_picture(
    name: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Invalid file type")

    result = db.execute(select(User).where(User.full_name == name))
    users = result.scalars().all()
    user = users[0] if len(users) == 1 else None

    folder = f"users/{name}/profilepic"
    public_id = (
        f"{name}-{user.id}" if user else f"{name}-{int(datetime.utcnow().timestamp())}"
    )
    upload = await upload_image(file, folder=folder, public_id=public_id)

    if user:
        user.profile_picture = upload["url"]
        db.commit()
        db.refresh(user)

    return UploadResponse(path=upload["url"]) 
