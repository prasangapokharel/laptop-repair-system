"""
Script to fix ALL existing orders in the database
Ensures every order has:
- customer_id (valid customer)
- problem_id (valid problem matching device type)
- device_id (already exists)
"""

import sys
import os
import random
from decimal import Decimal

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from db import SyncSessionLocal
from models.device import DeviceType, Device, Model
from models.problem import Problem
from models.user import User, Role, RoleEnroll
from models.order import Order
from utils.security import hash_password


def get_or_create_customers(db, count=10):
    """Get or create customer users"""
    customers = db.query(User).join(RoleEnroll).join(Role).filter(Role.name == "customer").all()
    
    if len(customers) >= count:
        return customers
    
    # Get or create customer role
    customer_role = db.query(Role).filter(Role.name == "customer").first()
    if not customer_role:
        customer_role = Role(name="customer", description="Customer role")
        db.add(customer_role)
        db.flush()
    
    # Create more customers if needed
    existing_count = len(customers)
    for i in range(existing_count, count):
        # Check if user exists by phone or email
        phone = f"555000{i:04d}"
        email = f"customer{i}@repairshop.com"
        
        existing_user = db.query(User).filter(
            (User.email == email) | (User.phone == phone)
        ).first()
        
        if existing_user:
            customers.append(existing_user)
            continue
        
        # Create new customer
        user = User(
            email=email,
            password_hash=hash_password("customer123"),
            full_name=f"Customer {i}",
            phone=phone,
            is_active=True
        )
        db.add(user)
        db.flush()
        
        # Assign customer role
        role_enroll = RoleEnroll(user_id=user.id, role_id=customer_role.id)
        db.add(role_enroll)
        db.flush()
        
        customers.append(user)
        print(f"  * Created Customer: {user.full_name} ({email})")
    
    return customers


def get_problems_for_device_type(db, device_type_id):
    """Get all problems for a specific device type"""
    problems = db.query(Problem).filter(Problem.device_type_id == device_type_id).all()
    return problems


def fix_orders(db):
    """Fix all orders to have customer_id, problem_id, and device_id"""
    
    print("\n" + "="*80)
    print("FIXING ALL ORDERS")
    print("="*80)
    
    # Get all orders
    all_orders = db.query(Order).all()
    total_orders = len(all_orders)
    
    print(f"\nFound {total_orders} orders to process")
    
    # Get or create customers
    print("\n1. Ensuring we have enough customers...")
    customers = get_or_create_customers(db, count=20)
    print(f"   Available customers: {len(customers)}")
    
    # Get all devices with their models and device types
    print("\n2. Loading devices...")
    devices = db.query(Device).join(Model).join(DeviceType).all()
    print(f"   Available devices: {len(devices)}")
    
    if not devices:
        print("\n[!] ERROR: No devices found in database!")
        print("    Please run the seed script first to create devices.")
        return
    
    # Process each order
    print("\n3. Fixing orders...")
    fixed_count = 0
    
    for order in all_orders:
        updated = False
        
        # Fix device_id if missing
        if not order.device_id:
            order.device_id = random.choice(devices).id
            updated = True
        
        # Get the device for this order
        device = db.query(Device).filter(Device.id == order.device_id).first()
        if not device:
            # If device doesn't exist, assign a random one
            device = random.choice(devices)
            order.device_id = device.id
            updated = True
        
        # Get the model and device type
        model = db.query(Model).filter(Model.id == device.model_id).first()
        device_type = db.query(DeviceType).filter(DeviceType.id == model.device_type_id).first() if model else None
        
        # Fix customer_id if missing
        if not order.customer_id:
            order.customer_id = random.choice(customers).id
            updated = True
        
        # Fix problem_id if missing
        if not order.problem_id and device_type:
            # Get problems for this device type
            problems = get_problems_for_device_type(db, device_type.id)
            
            if problems:
                order.problem_id = random.choice(problems).id
                updated = True
            else:
                # If no problems for this device type, get any problem
                any_problem = db.query(Problem).first()
                if any_problem:
                    order.problem_id = any_problem.id
                    updated = True
        
        if updated:
            fixed_count += 1
            if fixed_count % 10 == 0:
                print(f"   * Fixed {fixed_count} orders...")
    
    # Commit all changes
    db.commit()
    
    print(f"\n   Total orders fixed: {fixed_count}")
    
    # Verify all orders now have required fields
    print("\n4. Verifying fixes...")
    orders_without_customer = db.query(Order).filter(Order.customer_id == None).count()
    orders_without_problem = db.query(Order).filter(Order.problem_id == None).count()
    orders_without_device = db.query(Order).filter(Order.device_id == None).count()
    
    print(f"   Orders without customer_id: {orders_without_customer}")
    print(f"   Orders without problem_id: {orders_without_problem}")
    print(f"   Orders without device_id: {orders_without_device}")
    
    if orders_without_customer == 0 and orders_without_problem == 0 and orders_without_device == 0:
        print("\n" + "="*80)
        print("SUCCESS! All orders now have complete data!")
        print("="*80)
    else:
        print("\n" + "="*80)
        print("WARNING: Some orders still have missing data!")
        print("="*80)


def main():
    print("\nWARNING: This script will update ALL orders in your database.")
    response = input("Do you want to continue? (yes/no): ")
    
    if response.lower() != 'yes':
        print("Aborted.")
        return
    
    db = SyncSessionLocal()
    
    try:
        fix_orders(db)
    except Exception as e:
        print(f"\n[x] Error: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    main()
