from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import select
from typing import List, Optional
from db import get_db
from models.problem import CostSetting, Problem
from schemas.cost_setting import CostSettingCreate, CostSettingUpdate, CostSettingResponse
from utils.dependencies import require_admin

router = APIRouter(prefix="/cost-settings", tags=["cost-settings"])

@router.post("", response_model=CostSettingResponse, status_code=201)
async def create_cost_setting(
    data: CostSettingCreate,
    current_user = Depends(require_admin),
    db: Session = Depends(get_db)
):
    # Check if problem exists
    problem_exists = db.execute(select(Problem).where(Problem.id == data.problem_id))
    if not problem_exists.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Problem not found")

    cost_setting = CostSetting(
        problem_id=data.problem_id,
        base_cost=data.base_cost,
        min_cost=data.min_cost,
        max_cost=data.max_cost,
        is_active=data.is_active
    )
    db.add(cost_setting)
    db.commit()
    db.refresh(cost_setting)
    return cost_setting

@router.get("", response_model=List[CostSettingResponse])
async def list_cost_settings(
    problem_id: Optional[int] = Query(None),
    limit: int = Query(10, ge=1, le=100),
    offset: int = Query(0, ge=0),
    current_user = Depends(require_admin),
    db: Session = Depends(get_db)
):
    query = select(CostSetting)
    
    if problem_id is not None:
        query = query.where(CostSetting.problem_id == problem_id)
        
    result = db.execute(query.limit(limit).offset(offset))
    return result.scalars().all()

@router.get("/{id}", response_model=CostSettingResponse)
async def get_cost_setting(
    id: int,
    current_user = Depends(require_admin),
    db: Session = Depends(get_db)
):
    result = db.execute(select(CostSetting).where(CostSetting.id == id))
    cost_setting = result.scalar_one_or_none()
    if not cost_setting:
        raise HTTPException(status_code=404, detail="Cost setting not found")
    return cost_setting

@router.patch("/{id}", response_model=CostSettingResponse)
async def update_cost_setting(
    id: int,
    data: CostSettingUpdate,
    current_user = Depends(require_admin),
    db: Session = Depends(get_db)
):
    result = db.execute(select(CostSetting).where(CostSetting.id == id))
    cost_setting = result.scalar_one_or_none()
    if not cost_setting:
        raise HTTPException(status_code=404, detail="Cost setting not found")
    
    update_data = data.model_dump(exclude_unset=True)
    
    if "problem_id" in update_data:
        problem_exists = db.execute(select(Problem).where(Problem.id == update_data["problem_id"]))
        if not problem_exists.scalar_one_or_none():
            raise HTTPException(status_code=404, detail="Problem not found")

    for field, value in update_data.items():
        setattr(cost_setting, field, value)
    
    db.commit()
    db.refresh(cost_setting)
    return cost_setting

@router.delete("/{id}", status_code=204)
async def delete_cost_setting(
    id: int,
    current_user = Depends(require_admin),
    db: Session = Depends(get_db)
):
    result = db.execute(select(CostSetting).where(CostSetting.id == id))
    cost_setting = result.scalar_one_or_none()
    if not cost_setting:
        raise HTTPException(status_code=404, detail="Cost setting not found")
    
    db.delete(cost_setting)
    db.commit()
