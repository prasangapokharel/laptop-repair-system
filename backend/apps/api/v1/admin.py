from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import select, func
from db import get_db
from models.user import User
from models.device import Device, DeviceType, Brand, Model
from models.order import Order
from models.payment import Payment
from datetime import datetime, timedelta
from utils.dependencies import require_admin

router = APIRouter(prefix="/admin", tags=["admin"])

@router.get("/dashboard")
async def admin_dashboard(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    users_count = (db.execute(select(func.count(User.id)))).scalar() or 0
    devices_count = (db.execute(select(func.count(Device.id)))).scalar() or 0
    device_types_count = (db.execute(select(func.count(DeviceType.id)))).scalar() or 0
    brands_count = (db.execute(select(func.count(Brand.id)))).scalar() or 0
    models_count = (db.execute(select(func.count(Model.id)))).scalar() or 0
    orders_count = (db.execute(select(func.count(Order.id)))).scalar() or 0
    payments_count = (db.execute(select(func.count(Payment.id)))).scalar() or 0

    total_amount_paid = (
        (db.execute(select(func.coalesce(func.sum(Payment.amount), 0)).where(Payment.status == "Paid"))).scalar()
        or 0
    )
    total_amount_due = (
        (db.execute(select(func.coalesce(func.sum(Payment.due_amount), 0)))).scalar()
        or 0
    )

    # Chart Data (Last 90 days)
    ninety_days_ago = datetime.utcnow() - timedelta(days=90)
    
    orders = (db.execute(select(Order.created_at).where(Order.created_at >= ninety_days_ago))).scalars().all()
    payments = (db.execute(select(Payment.created_at).where(Payment.created_at >= ninety_days_ago))).scalars().all()
    
    data_map = {}
    for o in orders:
        if o is None:
            continue
        date_str = o.strftime("%Y-%m-%d")
        if date_str not in data_map:
            data_map[date_str] = {"date": date_str, "orders": 0, "payments": 0}
        data_map[date_str]["orders"] += 1
        
    for p in payments:
        if p is None:
            continue
        date_str = p.strftime("%Y-%m-%d")
        if date_str not in data_map:
            data_map[date_str] = {"date": date_str, "orders": 0, "payments": 0}
        data_map[date_str]["payments"] += 1
        
    chart_data = sorted(data_map.values(), key=lambda x: x["date"])

    return {
        "users_count": int(users_count),
        "devices_count": int(devices_count),
        "device_types_count": int(device_types_count),
        "brands_count": int(brands_count),
        "models_count": int(models_count),
        "orders_count": int(orders_count),
        "payments_count": int(payments_count),
        "total_amount_paid": float(total_amount_paid),
        "total_amount_due": float(total_amount_due),
        "chart_data": chart_data,
    }
