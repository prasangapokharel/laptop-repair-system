from typing import Optional, Dict
from cloudinary import config as cloudinary_config
from cloudinary import uploader
from fastapi import UploadFile
from core.config import settings

kwargs = {
    "cloud_name": settings.CLOUDINARY_CLOUD_NAME,
    "api_key": settings.CLOUDINARY_API_KEY,
    "api_secret": settings.CLOUDINARY_API_SECRET,
}
if settings.CLOUDINARY_UPLOAD_PREFIX:
    kwargs["upload_prefix"] = settings.CLOUDINARY_UPLOAD_PREFIX
if settings.CLOUDINARY_SECURE_DISTRIBUTION:
    kwargs["secure_distribution"] = settings.CLOUDINARY_SECURE_DISTRIBUTION
cloudinary_config(**kwargs)

async def upload_image(file: UploadFile, folder: str, public_id: Optional[str] = None) -> Dict[str, str]:
    data = await file.read()
    base = settings.PROJECT_NAME.strip("/") if hasattr(settings, "PROJECT_NAME") else ""
    sub = folder.strip("/")
    full_folder = f"{base}/{sub}" if base else sub
    result = uploader.upload(
        data,
        folder=full_folder,
        public_id=public_id,
        overwrite=True,
        resource_type="image",
    )
    return {
        "url": result.get("secure_url") or result.get("url"),
        "public_id": result.get("public_id"),
    }
