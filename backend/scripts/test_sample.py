import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from db import SyncSessionLocal
from models.order import Order
from models.user import User
from models.problem import Problem
from models.device import Device, Model, Brand, DeviceType

db = SyncSessionLocal()

print('\n' + '='*80)
print('SAMPLE ORDERS WITH ENRICHED DATA')
print('='*80 + '\n')

sample_ids = [2, 50, 100, 150, 162]

for order_id in sample_ids:
    order = db.query(Order).filter(Order.id == order_id).first()
    if order:
        customer = db.query(User).filter(User.id == order.customer_id).first()
        problem = db.query(Problem).filter(Problem.id == order.problem_id).first()
        device = db.query(Device).filter(Device.id == order.device_id).first()
        model = db.query(Model).filter(Model.id == device.model_id).first() if device else None
        brand = db.query(Brand).filter(Brand.id == model.brand_id).first() if model else None
        device_type = db.query(DeviceType).filter(DeviceType.id == model.device_type_id).first() if model else None
        
        print(f'Order #{order.id}:')
        print(f'  Customer: {customer.full_name} (ID: {order.customer_id})')
        print(f'  Problem: {problem.name} (ID: {order.problem_id})')
        print(f'  Device: {brand.name} {model.name}' if brand and model else 'N/A')
        print(f'  Device Type: {device_type.name}' if device_type else 'N/A')
        print(f'  Status: {order.status}')
        print(f'  Cost: ${order.cost}')
        print(f'  Total: ${order.total_cost}')
        print()

db.close()
