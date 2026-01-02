from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from decimal import Decimal

class CostSettingCreate(BaseModel):
    problem_id: int
    base_cost: Decimal
    min_cost: Optional[Decimal] = None
    max_cost: Optional[Decimal] = None
    is_active: Optional[bool] = True

class CostSettingUpdate(BaseModel):
    problem_id: Optional[int] = None
    base_cost: Optional[Decimal] = None
    min_cost: Optional[Decimal] = None
    max_cost: Optional[Decimal] = None
    is_active: Optional[bool] = None

class CostSettingResponse(BaseModel):
    id: int
    problem_id: int
    base_cost: Decimal
    min_cost: Optional[Decimal]
    max_cost: Optional[Decimal]
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
