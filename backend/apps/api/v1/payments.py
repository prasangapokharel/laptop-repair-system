from fastapi import APIRouter, Depends, HTTPException, Query
from utils.dependencies import require_admin, require_staff_or_customer, get_current_user, require_admin_or_accountant
from models.user import User
from sqlalchemy.orm import Session
from sqlalchemy import select
from typing import List, Optional
from datetime import datetime
from db import get_db
from models.payment import Payment
from models.order import Order
from schemas.payment import PaymentCreate, PaymentResponse, PaymentUpdate

router = APIRouter(prefix="/payments", tags=["payments"])


@router.post("", response_model=PaymentResponse, status_code=201)
async def create_payment(
    data: PaymentCreate,
    current_user: User = Depends(require_admin_or_accountant),
    db: Session = Depends(get_db)
):
    order = db.execute(select(Order).where(Order.id == data.order_id))
    order_obj = order.scalar_one_or_none()
    if not order_obj:
        raise HTTPException(status_code=404, detail="Order not found")
    
    payment = Payment(
        order_id=data.order_id,
        due_amount=data.due_amount,
        amount=data.amount,
        status=data.status,
        payment_method=data.payment_method,
        transaction_id=data.transaction_id
    )
    
    if data.status == "Paid" or (data.status == "Partial" and float(data.amount) > 0):
        setattr(payment, "paid_at", datetime.utcnow())
    
    db.add(payment)
    db.commit()
    db.refresh(payment)
    return payment


@router.get("", response_model=List[PaymentResponse])
async def list_payments(
    status: Optional[str] = Query(None),
    order_id: Optional[int] = Query(None),
    limit: int = Query(10, ge=1, le=100),
    offset: int = Query(0, ge=0),
    current_user: User = Depends(require_staff_or_customer),
    db: Session = Depends(get_db)
):
    query = select(Payment)
    if status is not None:
        query = query.where(Payment.status == status)
    if order_id is not None:
        query = query.where(Payment.order_id == order_id)
    query = query.limit(limit).offset(offset)
    result = db.execute(query)
    return result.scalars().all()


@router.get("/{payment_id}", response_model=PaymentResponse)
async def get_payment(
    payment_id: int,
    current_user: User = Depends(require_staff_or_customer),
    db: Session = Depends(get_db)
):
    result = db.execute(select(Payment).where(Payment.id == payment_id))
    payment = result.scalar_one_or_none()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    return payment


@router.patch("/{payment_id}", response_model=PaymentResponse)
async def update_payment(
    payment_id: int,
    data: PaymentUpdate,
    current_user: User = Depends(require_admin_or_accountant),
    db: Session = Depends(get_db)
):
    result = db.execute(select(Payment).where(Payment.id == payment_id))
    payment = result.scalar_one_or_none()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    
    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(payment, field, value)
    
    if "status" in update_data and update_data["status"] == "Paid":
        paid_at = getattr(payment, "paid_at", None)
        if paid_at is None:
            setattr(payment, "paid_at", datetime.utcnow())
    
    db.commit()
    db.refresh(payment)
    return payment


@router.delete("/{payment_id}", status_code=204)
async def delete_payment(
    payment_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    result = db.execute(select(Payment).where(Payment.id == payment_id))
    payment = result.scalar_one_or_none()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    db.delete(payment)
    db.commit()
    return None
