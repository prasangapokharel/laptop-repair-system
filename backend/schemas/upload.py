from pydantic import BaseModel

class UploadResponse(BaseModel):
    path: str
