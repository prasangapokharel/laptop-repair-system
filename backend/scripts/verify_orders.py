"""
Verify that all orders have complete data
"""

import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from db import SyncSessionLocal
from models.order import Order
from models.user import User
from models.problem import Problem
from models.device import Device, Model, Brand

def verify_orders():
    db = SyncSessionLocal()
    
    try:
        # Get total count
        total = db.query(Order).count()
        print(f"\n{'='*80}")
        print(f"VERIFYING ALL {total} ORDERS")
        print(f"{'='*80}\n")
        
        # Get first 10 orders
        print("First 10 Orders:")
        print("-" * 80)
        orders = db.query(Order).order_by(Order.id).limit(10).all()
        
        for order in orders:
            customer = db.query(User).filter(User.id == order.customer_id).first()
            problem = db.query(Problem).filter(Problem.id == order.problem_id).first()
            device = db.query(Device).filter(Device.id == order.device_id).first()
            
            device_name = "N/A"
            if device:
                model = db.query(Model).filter(Model.id == device.model_id).first()
                if model:
                    brand = db.query(Brand).filter(Brand.id == model.brand_id).first()
                    if brand:
                        device_name = f"{brand.name} {model.name}"
            
            customer_name = customer.full_name if customer else "N/A"
            problem_name = problem.name if problem else "N/A"
            
            print(f"Order #{order.id}:")
            print(f"  Customer: {customer_name}")
            print(f"  Problem: {problem_name}")
            print(f"  Device: {device_name}")
            print(f"  Status: {order.status}")
            print()
        
        # Get last 10 orders
        print("\nLast 10 Orders:")
        print("-" * 80)
        orders = db.query(Order).order_by(Order.id.desc()).limit(10).all()
        
        for order in orders:
            customer = db.query(User).filter(User.id == order.customer_id).first()
            problem = db.query(Problem).filter(Problem.id == order.problem_id).first()
            device = db.query(Device).filter(Device.id == order.device_id).first()
            
            device_name = "N/A"
            if device:
                model = db.query(Model).filter(Model.id == device.model_id).first()
                if model:
                    brand = db.query(Brand).filter(Brand.id == model.brand_id).first()
                    if brand:
                        device_name = f"{brand.name} {model.name}"
            
            customer_name = customer.full_name if customer else "N/A"
            problem_name = problem.name if problem else "N/A"
            
            print(f"Order #{order.id}:")
            print(f"  Customer: {customer_name}")
            print(f"  Problem: {problem_name}")
            print(f"  Device: {device_name}")
            print(f"  Status: {order.status}")
            print()
        
        # Final statistics
        print(f"\n{'='*80}")
        print("FINAL STATISTICS")
        print(f"{'='*80}")
        
        total_orders = db.query(Order).count()
        orders_with_customer = db.query(Order).filter(Order.customer_id != None).count()
        orders_with_problem = db.query(Order).filter(Order.problem_id != None).count()
        orders_with_device = db.query(Order).filter(Order.device_id != None).count()
        
        print(f"\nTotal Orders: {total_orders}")
        print(f"Orders with customer_id: {orders_with_customer} ({100*orders_with_customer//total_orders}%)")
        print(f"Orders with problem_id: {orders_with_problem} ({100*orders_with_problem//total_orders}%)")
        print(f"Orders with device_id: {orders_with_device} ({100*orders_with_device//total_orders}%)")
        
        if orders_with_customer == total_orders and orders_with_problem == total_orders and orders_with_device == total_orders:
            print(f"\n{chr(10004)} SUCCESS: All orders have complete data!")
        else:
            print(f"\n{chr(10008)} WARNING: Some orders still have missing data!")
        
        print(f"\n{'='*80}\n")
        
    finally:
        db.close()


if __name__ == "__main__":
    verify_orders()
