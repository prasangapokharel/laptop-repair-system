from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from typing import List, Optional
from db import get_db
from models.problem import Problem
from schemas.problem import ProblemCreate, ProblemUpdate, ProblemResponse, ProblemListResponse
from utils.dependencies import require_admin, require_staff_or_customer

router = APIRouter(prefix="/problems", tags=["problems"])

@router.post("", response_model=ProblemResponse, status_code=201)
async def create_problem(
    problem_data: ProblemCreate,
    current_user = Depends(require_admin),
    db: Session = Depends(get_db)
):
    # Check if exists
    existing = db.execute(
        select(Problem).where(
            Problem.device_type_id == problem_data.device_type_id,
            Problem.name == problem_data.name
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Problem already exists for this device type")
    
    problem = Problem(
        device_type_id=problem_data.device_type_id,
        name=problem_data.name,
        description=problem_data.description
    )
    db.add(problem)
    db.commit()
    db.refresh(problem)
    return problem

@router.get("", response_model=ProblemListResponse)
async def list_problems(
    device_type_id: Optional[int] = Query(None),
    limit: int = Query(10, ge=1, le=100),
    offset: int = Query(0, ge=0),
    current_user = Depends(require_staff_or_customer),
    db: Session = Depends(get_db)
):
    # Base query
    query = select(Problem).options(selectinload(Problem.device_type))
    count_query = select(func.count()).select_from(Problem)

    if device_type_id is not None:
        query = query.where(Problem.device_type_id == device_type_id)
        count_query = count_query.where(Problem.device_type_id == device_type_id)

    # Get total
    count_result = db.execute(count_query)
    total = count_result.scalar()

    # Get items
    result = db.execute(query.limit(limit).offset(offset))
    items = result.scalars().all()

    return {
        "items": items,
        "total": total,
        "page": (offset // limit) + 1,
        "limit": limit
    }

@router.get("/{problem_id}", response_model=ProblemResponse)
async def get_problem(
    problem_id: int,
    current_user = Depends(require_staff_or_customer),
    db: Session = Depends(get_db)
):
    result = db.execute(
        select(Problem)
        .options(selectinload(Problem.device_type))
        .where(Problem.id == problem_id)
    )
    problem = result.scalar_one_or_none()
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")
    return problem

@router.patch("/{problem_id}", response_model=ProblemResponse)
async def update_problem(
    problem_id: int, 
    problem_data: ProblemUpdate, 
    current_user = Depends(require_admin),
    db: Session = Depends(get_db)
):
    result = db.execute(select(Problem).where(Problem.id == problem_id))
    problem = result.scalar_one_or_none()
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")

    update_data = problem_data.model_dump(exclude_unset=True)
    
    # Check uniqueness if updating name or device_type
    if "name" in update_data or "device_type_id" in update_data:
        new_name = update_data.get("name", problem.name)
        new_type = update_data.get("device_type_id", problem.device_type_id)
        
        existing = db.execute(
            select(Problem).where(
                Problem.device_type_id == new_type,
                Problem.name == new_name,
                Problem.id != problem_id
            )
        )
        if existing.scalar_one_or_none():
            raise HTTPException(status_code=400, detail="Problem with this name already exists for this device type")

    for field, value in update_data.items():
        setattr(problem, field, value)
    
    db.commit()
    db.refresh(problem)
    return problem


@router.delete("/{problem_id}", status_code=204)
async def delete_problem(
    problem_id: int,
    current_user = Depends(require_admin),
    db: Session = Depends(get_db)
):
    result = db.execute(select(Problem).where(Problem.id == problem_id))
    problem = result.scalar_one_or_none()
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")
    
    db.delete(problem)
    db.commit()
