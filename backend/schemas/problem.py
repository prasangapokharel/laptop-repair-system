from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from schemas.device import DeviceTypeResponse

class ProblemCreate(BaseModel):
    device_type_id: int
    name: str
    description: Optional[str] = None

class ProblemUpdate(BaseModel):
    device_type_id: Optional[int] = None
    name: Optional[str] = None
    description: Optional[str] = None

class ProblemResponse(BaseModel):
    id: int
    device_type_id: int
    name: str
    description: Optional[str]
    created_at: datetime
    device_type: Optional[DeviceTypeResponse] = None

    class Config:
        from_attributes = True

class ProblemListResponse(BaseModel):
    items: List[ProblemResponse]
    total: int
    page: int
    limit: int
