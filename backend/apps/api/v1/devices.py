from fastapi import APIRouter, Depends, HTTPException, Query
from utils.dependencies import require_admin, require_staff_or_customer, get_current_user, require_admin_or_receptionist
from models.user import User
from sqlalchemy.orm import Session
from sqlalchemy import select
from typing import List
from db import get_db
from models.device import DeviceType, Brand, Model, Device
from schemas.device import (
    DeviceTypeCreate, DeviceTypeResponse, DeviceTypeUpdate,
    BrandCreate, BrandResponse, BrandUpdate,
    ModelCreate, ModelResponse, ModelUpdate,
    DeviceCreate, DeviceResponse, DeviceUpdate
)

router = APIRouter(prefix="/devices", tags=["devices"])


@router.post("/types", response_model=DeviceTypeResponse, status_code=201)
async def create_device_type(
    data: DeviceTypeCreate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    existing = db.execute(select(DeviceType).where(DeviceType.name == data.name))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Device type already exists")
    
    device_type = DeviceType(name=data.name, description=data.description)
    db.add(device_type)
    db.commit()
    db.refresh(device_type)
    return device_type


@router.get("/types", response_model=List[DeviceTypeResponse])
async def list_device_types(
    current_user: User = Depends(require_staff_or_customer),
    db: Session = Depends(get_db)
):
    try:
        result = db.execute(select(DeviceType))
        items = result.scalars().all()
        return items
    except Exception as e:
        import traceback
        print(f"ERROR in list_device_types: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.get("/types/{type_id}", response_model=DeviceTypeResponse)
async def get_device_type(
    type_id: int,
    current_user: User = Depends(require_staff_or_customer),
    db: Session = Depends(get_db)
):
    result = db.execute(select(DeviceType).where(DeviceType.id == type_id))
    device_type = result.scalar_one_or_none()
    if not device_type:
        raise HTTPException(status_code=404, detail="Device type not found")
    return device_type


@router.patch("/types/{type_id}", response_model=DeviceTypeResponse)
async def update_device_type(
    type_id: int,
    data: DeviceTypeUpdate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    result = db.execute(select(DeviceType).where(DeviceType.id == type_id))
    device_type = result.scalar_one_or_none()
    if not device_type:
        raise HTTPException(status_code=404, detail="Device type not found")
    
    update_data = data.model_dump(exclude_unset=True)
    if "name" in update_data and update_data["name"] != device_type.name:
        existing = db.execute(select(DeviceType).where(DeviceType.name == update_data["name"]))
        if existing.scalar_one_or_none():
            raise HTTPException(status_code=400, detail="Device type name already exists")

    for field, value in update_data.items():
        setattr(device_type, field, value)
    
    db.commit()
    db.refresh(device_type)
    return device_type


@router.delete("/types/{type_id}", status_code=204)
async def delete_device_type(
    type_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    result = db.execute(select(DeviceType).where(DeviceType.id == type_id))
    device_type = result.scalar_one_or_none()
    if not device_type:
        raise HTTPException(status_code=404, detail="Device type not found")
    db.delete(device_type)
    db.commit()


@router.post("/brands", response_model=BrandResponse, status_code=201)
async def create_brand(
    data: BrandCreate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    existing = db.execute(select(Brand).where(Brand.name == data.name))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Brand already exists")
    
    brand = Brand(name=data.name)
    db.add(brand)
    db.commit()
    db.refresh(brand)
    return brand


@router.get("/brands", response_model=List[BrandResponse])
async def list_brands(
    current_user: User = Depends(require_staff_or_customer),
    db: Session = Depends(get_db)
):
    result = db.execute(select(Brand))
    return result.scalars().all()


@router.get("/brands/{brand_id}", response_model=BrandResponse)
async def get_brand(
    brand_id: int,
    current_user: User = Depends(require_staff_or_customer),
    db: Session = Depends(get_db)
):
    result = db.execute(select(Brand).where(Brand.id == brand_id))
    brand = result.scalar_one_or_none()
    if not brand:
        raise HTTPException(status_code=404, detail="Brand not found")
    return brand


@router.patch("/brands/{brand_id}", response_model=BrandResponse)
async def update_brand(
    brand_id: int,
    data: BrandUpdate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    result = db.execute(select(Brand).where(Brand.id == brand_id))
    brand = result.scalar_one_or_none()
    if not brand:
        raise HTTPException(status_code=404, detail="Brand not found")
    
    update_data = data.model_dump(exclude_unset=True)
    if "name" in update_data and update_data["name"] != brand.name:
        existing = db.execute(select(Brand).where(Brand.name == update_data["name"]))
        if existing.scalar_one_or_none():
            raise HTTPException(status_code=400, detail="Brand name already exists")

    for field, value in update_data.items():
        setattr(brand, field, value)
    
    db.commit()
    db.refresh(brand)
    return brand


@router.delete("/brands/{brand_id}", status_code=204)
async def delete_brand(
    brand_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    result = db.execute(select(Brand).where(Brand.id == brand_id))
    brand = result.scalar_one_or_none()
    if not brand:
        raise HTTPException(status_code=404, detail="Brand not found")
    db.delete(brand)
    db.commit()


@router.post("/models", response_model=ModelResponse, status_code=201)
async def create_model(
    data: ModelCreate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    existing = db.execute(
        select(Model).where(
            Model.brand_id == data.brand_id,
            Model.name == data.name,
            Model.device_type_id == data.device_type_id
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Model already exists")
    
    model = Model(brand_id=data.brand_id, name=data.name, device_type_id=data.device_type_id)
    db.add(model)
    db.commit()
    db.refresh(model)
    return model


@router.get("/models", response_model=List[ModelResponse])
async def list_models(
    current_user: User = Depends(require_staff_or_customer),
    db: Session = Depends(get_db)
):
    result = db.execute(select(Model))
    return result.scalars().all()


@router.patch("/models/{model_id}", response_model=ModelResponse)
async def update_model(
    model_id: int,
    data: ModelUpdate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    result = db.execute(select(Model).where(Model.id == model_id))
    model = result.scalar_one_or_none()
    if not model:
        raise HTTPException(status_code=404, detail="Model not found")
    
    update_data = data.model_dump(exclude_unset=True)
    
    # Check uniqueness if key fields change
    brand_id = update_data.get("brand_id", model.brand_id)
    name = update_data.get("name", model.name)
    device_type_id = update_data.get("device_type_id", model.device_type_id)
    
    if brand_id != model.brand_id or name != model.name or device_type_id != model.device_type_id:
        existing = db.execute(
            select(Model).where(
                Model.brand_id == brand_id,
                Model.name == name,
                Model.device_type_id == device_type_id,
                Model.id != model_id
            )
        )
        if existing.scalar_one_or_none():
            raise HTTPException(status_code=400, detail="Model already exists")

    for field, value in update_data.items():
        setattr(model, field, value)
    
    db.commit()
    db.refresh(model)
    return model


@router.delete("/models/{model_id}", status_code=204)
async def delete_model(
    model_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    result = db.execute(select(Model).where(Model.id == model_id))
    model = result.scalar_one_or_none()
    if not model:
        raise HTTPException(status_code=404, detail="Model not found")
    db.delete(model)
    db.commit()


@router.post("", response_model=DeviceResponse, status_code=201)
async def create_device(
    data: DeviceCreate,
    current_user: User = Depends(require_admin_or_receptionist),
    db: Session = Depends(get_db)
):
    if data.serial_number:
        existing = db.execute(select(Device).where(Device.serial_number == data.serial_number))
        if existing.scalar_one_or_none():
            raise HTTPException(status_code=400, detail="Serial number already exists")
    
    device = Device(
        brand_id=data.brand_id,
        model_id=data.model_id,
        device_type_id=data.device_type_id,
        serial_number=data.serial_number,
        owner_id=data.owner_id,
        notes=data.notes
    )
    db.add(device)
    db.commit()
    db.refresh(device)
    return device


@router.get("", response_model=List[DeviceResponse])
async def list_devices(
    limit: int = Query(10, ge=1, le=100),
    offset: int = Query(0, ge=0),
    current_user: User = Depends(require_staff_or_customer),
    db: Session = Depends(get_db)
):
    result = db.execute(select(Device).limit(limit).offset(offset))
    return result.scalars().all()


@router.get("/{device_id}", response_model=DeviceResponse)
async def get_device(
    device_id: int,
    current_user: User = Depends(require_staff_or_customer),
    db: Session = Depends(get_db)
):
    result = db.execute(select(Device).where(Device.id == device_id))
    device = result.scalar_one_or_none()
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")
    return device


@router.patch("/{device_id}", response_model=DeviceResponse)
async def update_device(
    device_id: int,
    data: DeviceUpdate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    result = db.execute(select(Device).where(Device.id == device_id))
    device = result.scalar_one_or_none()
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")
    
    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(device, field, value)
    
    db.commit()
    db.refresh(device)
    return device


@router.delete("/{device_id}", status_code=204)
async def delete_device(
    device_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    result = db.execute(select(Device).where(Device.id == device_id))
    device = result.scalar_one_or_none()
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")
    db.delete(device)
    db.commit()
