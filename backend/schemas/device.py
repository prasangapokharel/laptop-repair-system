from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class DeviceTypeCreate(BaseModel):
    name: str
    description: Optional[str] = None


class DeviceTypeUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None


class DeviceTypeResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class BrandCreate(BaseModel):
    name: str


class BrandUpdate(BaseModel):
    name: Optional[str] = None


class BrandResponse(BaseModel):
    id: int
    name: str
    created_at: datetime

    class Config:
        from_attributes = True


class ModelCreate(BaseModel):
    brand_id: int
    name: str
    device_type_id: int


class ModelUpdate(BaseModel):
    brand_id: Optional[int] = None
    name: Optional[str] = None
    device_type_id: Optional[int] = None


class ModelResponse(BaseModel):
    id: int
    brand_id: int
    name: str
    device_type_id: int
    created_at: datetime

    class Config:
        from_attributes = True


class DeviceCreate(BaseModel):
    brand_id: int
    model_id: int
    device_type_id: int
    serial_number: Optional[str] = None
    owner_id: Optional[int] = None
    notes: Optional[str] = None


class DeviceUpdate(BaseModel):
    brand_id: Optional[int] = None
    model_id: Optional[int] = None
    device_type_id: Optional[int] = None
    serial_number: Optional[str] = None
    owner_id: Optional[int] = None
    notes: Optional[str] = None


class DeviceResponse(BaseModel):
    id: int
    brand_id: int
    model_id: int
    device_type_id: int
    serial_number: Optional[str]
    owner_id: Optional[int]
    notes: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
