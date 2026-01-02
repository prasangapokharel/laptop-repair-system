from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from typing import List, Optional
from decimal import Decimal
from db import get_db
from models.order import Order, OrderAssign, OrderStatusHistory
from models.problem import Problem
from schemas.order import OrderCreate, OrderResponse, OrderUpdate, OrderAssignCreate, OrderAssignResponse, OrderListResponse, OrderStatusHistoryResponse
from utils.dependencies import get_current_user, require_admin, require_staff_or_customer, require_admin_or_receptionist, require_admin_or_technician
from models.user import User

router = APIRouter(prefix="/orders", tags=["orders"])


@router.post("", response_model=OrderResponse, status_code=201)
async def create_order(
    data: OrderCreate,
    current_user: User = Depends(require_admin_or_receptionist),
    db: Session = Depends(get_db)
):
    from models.device import Device
    
    device = db.execute(select(Device).where(Device.id == data.device_id))
    if not device.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Device not found")
    
    total_cost = max(Decimal("0.00"), data.cost - data.discount)
    order = Order(
        device_id=data.device_id,
        customer_id=data.customer_id,
        problem_id=data.problem_id,
        cost=data.cost,
        discount=data.discount,
        total_cost=total_cost,
        note=data.note,
        status=data.status,
        estimated_completion_date=data.estimated_completion_date
    )
    db.add(order)
    db.commit()
    db.refresh(order)
    
    # Reload with problem relationship
    if order.problem_id is not None:
        result = db.execute(
            select(Order)
            .options(
                selectinload(Order.problem).selectinload(Problem.device_type)
            )
            .where(Order.id == order.id)
        )
        order = result.scalar_one_or_none()
        
    return order


@router.get("", response_model=OrderListResponse)
async def list_orders(
    status: Optional[str] = Query(None),
    customer_id: Optional[int] = Query(None),
    device_id: Optional[int] = Query(None),
    limit: int = Query(10, ge=1, le=100),
    offset: int = Query(0, ge=0),
    current_user: User = Depends(require_staff_or_customer),
    db: Session = Depends(get_db)
):
    # Base query for counting
    count_query = select(func.count()).select_from(Order)
    if status is not None:
        count_query = count_query.where(Order.status == status)
    if customer_id is not None:
        count_query = count_query.where(Order.customer_id == customer_id)
    if device_id is not None:
        count_query = count_query.where(Order.device_id == device_id)
    
    count_result = db.execute(count_query)
    total = count_result.scalar()

    # Query for items
    query = select(Order).options(
        selectinload(Order.problem).selectinload(Problem.device_type)
    )
    if status is not None:
        query = query.where(Order.status == status)
    if customer_id is not None:
        query = query.where(Order.customer_id == customer_id)
    if device_id is not None:
        query = query.where(Order.device_id == device_id)
    
    query = query.limit(limit).offset(offset)
    result = db.execute(query)
    items = result.scalars().all()
    
    return {
        "items": items,
        "total": total,
        "page": (offset // limit) + 1,
        "limit": limit
    }


@router.get("/{order_id}", response_model=OrderResponse)
async def get_order(
    order_id: int,
    current_user: User = Depends(require_staff_or_customer),
    db: Session = Depends(get_db)
):
    result = db.execute(
        select(Order)
        .options(
            selectinload(Order.problem).selectinload(Problem.device_type)
        )
        .where(Order.id == order_id)
    )
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


@router.patch("/{order_id}", response_model=OrderResponse)
async def update_order(
    order_id: int, 
    data: OrderUpdate, 
    current_user: User = Depends(require_admin_or_technician),
    db: Session = Depends(get_db)
):
    result = db.execute(select(Order).where(Order.id == order_id))
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    old_status = order.status
    
    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(order, field, value)
    
    if "cost" in update_data or "discount" in update_data:
        new_total = max(Decimal("0.00"), order.cost - order.discount)
        setattr(order, "total_cost", new_total)
        
    # If status changed, add history
    if "status" in update_data and update_data["status"] != old_status:
        history = OrderStatusHistory(
            order_id=order.id,
            status=update_data["status"],
            changed_by=current_user.id,
            note=f"Status changed from {old_status} to {update_data['status']}"
        )
        db.add(history)
    
    db.commit()
    db.refresh(order)

    # Reload with problem relationship
    if order.problem_id is not None:
        result = db.execute(
            select(Order)
            .options(
                selectinload(Order.problem).selectinload(Problem.device_type)
            )
            .where(Order.id == order.id)
        )
        order = result.scalar_one_or_none()

    return order


@router.delete("/{order_id}", status_code=204)
async def delete_order(
    order_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    result = db.execute(select(Order).where(Order.id == order_id))
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    db.delete(order)
    db.commit()
    return None


@router.post("/assign", response_model=OrderAssignResponse, status_code=201)
async def assign_order(
    data: OrderAssignCreate,
    current_user: User = Depends(require_admin_or_receptionist),
    db: Session = Depends(get_db)
):
    existing = db.execute(
        select(OrderAssign).where(
            OrderAssign.order_id == data.order_id,
            OrderAssign.user_id == data.user_id
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Order already assigned to this user")
    
    assign = OrderAssign(order_id=data.order_id, user_id=data.user_id)
    db.add(assign)
    db.commit()
    db.refresh(assign)
    return assign


@router.get("/assign/{order_id}", response_model=List[OrderAssignResponse])
async def get_order_assignments(
    order_id: int,
    current_user: User = Depends(require_staff_or_customer),
    db: Session = Depends(get_db)
):
    result = db.execute(select(OrderAssign).where(OrderAssign.order_id == order_id))
    return result.scalars().all()


@router.get("/{order_id}/history", response_model=List[OrderStatusHistoryResponse])
async def get_order_history(
    order_id: int,
    current_user: User = Depends(require_staff_or_customer),
    db: Session = Depends(get_db)
):
    # Check if order exists
    order = db.execute(select(Order).where(Order.id == order_id))
    if not order.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Order not found")
        
    result = db.execute(
        select(OrderStatusHistory)
        .where(OrderStatusHistory.order_id == order_id)
        .order_by(OrderStatusHistory.created_at.desc())
    )
    return result.scalars().all()
