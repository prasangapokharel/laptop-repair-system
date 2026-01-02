from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import select
from typing import List, Optional
from db import get_db
from models.order import OrderAssign, Order
from models.user import User
from schemas.order import OrderAssignCreate, OrderAssignResponse
from utils.dependencies import require_admin, require_admin_or_receptionist, require_staff_or_customer

router = APIRouter(prefix="/assigns", tags=["assigns"])


@router.post("", response_model=OrderAssignResponse, status_code=201)
async def create_assign(
    data: OrderAssignCreate,
    current_user: User = Depends(require_admin_or_receptionist),
    db: Session = Depends(get_db)
):
    order = db.execute(select(Order).where(Order.id == data.order_id))
    if not order.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Order not found")
    
    user = db.execute(select(User).where(User.id == data.user_id))
    if not user.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="User not found")
    
    existing = db.execute(
        select(OrderAssign).where(
            OrderAssign.order_id == data.order_id,
            OrderAssign.user_id == data.user_id
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Assignment already exists")
    
    assign = OrderAssign(order_id=data.order_id, user_id=data.user_id)
    db.add(assign)
    db.commit()
    db.refresh(assign)
    return assign


@router.get("", response_model=List[OrderAssignResponse])
async def list_assigns(
    order_id: Optional[int] = Query(None),
    user_id: Optional[int] = Query(None),
    limit: int = Query(10, ge=1, le=100),
    offset: int = Query(0, ge=0),
    current_user: User = Depends(require_staff_or_customer),
    db: Session = Depends(get_db)
):
    query = select(OrderAssign)
    if order_id is not None:
        query = query.where(OrderAssign.order_id == order_id)
    if user_id is not None:
        query = query.where(OrderAssign.user_id == user_id)
    query = query.limit(limit).offset(offset)
    result = db.execute(query)
    return result.scalars().all()


@router.get("/{assign_id}", response_model=OrderAssignResponse)
async def get_assign(
    assign_id: int,
    current_user: User = Depends(require_staff_or_customer),
    db: Session = Depends(get_db)
):
    result = db.execute(select(OrderAssign).where(OrderAssign.id == assign_id))
    assign = result.scalar_one_or_none()
    if not assign:
        raise HTTPException(status_code=404, detail="Assignment not found")
    return assign


@router.delete("/{assign_id}", status_code=204)
async def delete_assign(
    assign_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    result = db.execute(select(OrderAssign).where(OrderAssign.id == assign_id))
    assign = result.scalar_one_or_none()
    if not assign:
        raise HTTPException(status_code=404, detail="Assignment not found")
    db.delete(assign)
    db.commit()
    return None
