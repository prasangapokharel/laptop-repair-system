"""
Seed script to create complete order data with proper relationships
This script creates:
- Device Types, Brands, Models
- Problems linked to device types
- Devices with proper relationships
- Customers (users with customer role)
- Orders with proper customer_id, device_id, and problem_id
"""

import sys
import os
from decimal import Decimal
from datetime import datetime, timedelta
import random

# Add parent directory to path to import modules
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from db import SyncSessionLocal
from models.device import DeviceType, Brand, Model, Device
from models.problem import Problem
from models.user import User, Role, RoleEnroll
from models.order import Order
from utils.security import hash_password


def get_or_create_device_type(db, name: str, description = None):
    """Get existing device type or create new one"""
    device_type = db.query(DeviceType).filter(DeviceType.name == name).first()
    if not device_type:
        device_type = DeviceType(name=name, description=description)
        db.add(device_type)
        db.flush()
        print(f"  * Created Device Type: {name}")
    return device_type


def get_or_create_brand(db, name: str):
    """Get existing brand or create new one"""
    brand = db.query(Brand).filter(Brand.name == name).first()
    if not brand:
        brand = Brand(name=name)
        db.add(brand)
        db.flush()
        print(f"  * Created Brand: {name}")
    return brand


def get_or_create_model(db, name: str, brand_id: int, device_type_id: int):
    """Get existing model or create new one"""
    model = db.query(Model).filter(
        Model.name == name,
        Model.brand_id == brand_id,
        Model.device_type_id == device_type_id
    ).first()
    if not model:
        model = Model(name=name, brand_id=brand_id, device_type_id=device_type_id)
        db.add(model)
        db.flush()
        print(f"  * Created Model: {name}")
    return model


def get_or_create_problem(db, name: str, device_type_id: int, description = None):
    """Get existing problem or create new one"""
    problem = db.query(Problem).filter(
        Problem.name == name,
        Problem.device_type_id == device_type_id
    ).first()
    if not problem:
        problem = Problem(
            name=name,
            device_type_id=device_type_id,
            description=description
        )
        db.add(problem)
        db.flush()
        print(f"  * Created Problem: {name}")
    return problem


def get_or_create_customer(db, email: str, full_name: str, phone: str):
    """Get existing customer or create new one"""
    # Check by both email and phone
    user = db.query(User).filter(
        (User.email == email) | (User.phone == phone)
    ).first()
    if not user:
        # Create user
        user = User(
            email=email,
            password_hash=hash_password("customer123"),
            full_name=full_name,
            phone=phone,
            is_active=True
        )
        db.add(user)
        db.flush()
        
        # Get or create customer role
        customer_role = db.query(Role).filter(Role.name == "customer").first()
        if not customer_role:
            customer_role = Role(name="customer", description="Customer role")
            db.add(customer_role)
            db.flush()
        
        # Assign role to user
        role_enroll = RoleEnroll(user_id=user.id, role_id=customer_role.id)
        db.add(role_enroll)
        db.flush()
        
        print(f"  * Created Customer: {full_name} ({email})")
    return user


def create_device(db, brand_id: int, model_id: int, device_type_id: int,
                  serial_number: str, owner_id = None, notes = None):
    """Create a device"""
    device = Device(
        brand_id=brand_id,
        model_id=model_id,
        device_type_id=device_type_id,
        serial_number=serial_number,
        owner_id=owner_id,
        notes=notes
    )
    db.add(device)
    db.flush()
    return device


def seed_complete_orders():
    """Seed complete order data with all relationships"""
    db = SyncSessionLocal()
    
    try:
        print("\n" + "="*80)
        print("SEEDING COMPLETE ORDER DATA")
        print("="*80 + "\n")

        # 1. Create Device Types
        print("1. Creating Device Types...")
        laptop_type = get_or_create_device_type(db, "Laptop", "Portable computers")
        desktop_type = get_or_create_device_type(db, "Desktop", "Desktop computers")
        tablet_type = get_or_create_device_type(db, "Tablet", "Tablet devices")
        smartphone_type = get_or_create_device_type(db, "Smartphone", "Mobile phones")
        db.commit()

        # 2. Create Brands
        print("\n2. Creating Brands...")
        dell = get_or_create_brand(db, "Dell")
        hp = get_or_create_brand(db, "HP")
        lenovo = get_or_create_brand(db, "Lenovo")
        apple = get_or_create_brand(db, "Apple")
        asus = get_or_create_brand(db, "ASUS")
        samsung = get_or_create_brand(db, "Samsung")
        db.commit()

        # 3. Create Models
        print("\n3. Creating Models...")
        # Laptop models
        dell_xps = get_or_create_model(db, "XPS 13", dell.id, laptop_type.id)
        dell_latitude = get_or_create_model(db, "Latitude 7420", dell.id, laptop_type.id)
        hp_pavilion = get_or_create_model(db, "Pavilion 15", hp.id, laptop_type.id)
        lenovo_thinkpad = get_or_create_model(db, "ThinkPad X1 Carbon", lenovo.id, laptop_type.id)
        macbook_pro = get_or_create_model(db, "MacBook Pro 14", apple.id, laptop_type.id)
        asus_zenbook = get_or_create_model(db, "ZenBook 14", asus.id, laptop_type.id)
        
        # Desktop models
        dell_optiplex = get_or_create_model(db, "OptiPlex 7090", dell.id, desktop_type.id)
        hp_prodesk = get_or_create_model(db, "ProDesk 600", hp.id, desktop_type.id)
        
        # Tablet models
        ipad = get_or_create_model(db, "iPad Pro", apple.id, tablet_type.id)
        samsung_tab = get_or_create_model(db, "Galaxy Tab S8", samsung.id, tablet_type.id)
        
        # Smartphone models
        iphone = get_or_create_model(db, "iPhone 14 Pro", apple.id, smartphone_type.id)
        samsung_galaxy = get_or_create_model(db, "Galaxy S23", samsung.id, smartphone_type.id)
        db.commit()

        # 4. Create Problems
        print("\n4. Creating Problems...")
        # Laptop problems
        laptop_problems = [
            get_or_create_problem(db, "Screen Broken", laptop_type.id, "Display is cracked or not working"),
            get_or_create_problem(db, "Battery Not Charging", laptop_type.id, "Battery won't charge or hold charge"),
            get_or_create_problem(db, "Keyboard Malfunction", laptop_type.id, "Keys not working properly"),
            get_or_create_problem(db, "Overheating", laptop_type.id, "Device gets too hot during use"),
            get_or_create_problem(db, "Hard Drive Failure", laptop_type.id, "Storage drive not working"),
            get_or_create_problem(db, "Wi-Fi Not Working", laptop_type.id, "Cannot connect to wireless networks"),
            get_or_create_problem(db, "No Power", laptop_type.id, "Device won't turn on"),
        ]
        
        # Desktop problems
        desktop_problems = [
            get_or_create_problem(db, "No Display", desktop_type.id, "Monitor shows no signal"),
            get_or_create_problem(db, "Blue Screen Error", desktop_type.id, "System crashes with blue screen"),
            get_or_create_problem(db, "Slow Performance", desktop_type.id, "System running very slow"),
        ]
        
        # Tablet problems
        tablet_problems = [
            get_or_create_problem(db, "Touch Screen Not Working", tablet_type.id, "Touch input not responsive"),
            get_or_create_problem(db, "Battery Draining Fast", tablet_type.id, "Battery depletes quickly"),
        ]
        
        # Smartphone problems
        smartphone_problems = [
            get_or_create_problem(db, "Screen Cracked", smartphone_type.id, "Display is physically damaged"),
            get_or_create_problem(db, "Charging Port Damaged", smartphone_type.id, "Cannot charge the device"),
        ]
        db.commit()

        # 5. Create Customers
        print("\n5. Creating Customers...")
        customers = [
            get_or_create_customer(db, "john.doe@example.com", "John Doe", "1234567890"),
            get_or_create_customer(db, "jane.smith@example.com", "Jane Smith", "1234567891"),
            get_or_create_customer(db, "mike.wilson@example.com", "Mike Wilson", "1234567892"),
            get_or_create_customer(db, "sarah.johnson@example.com", "Sarah Johnson", "1234567893"),
            get_or_create_customer(db, "david.brown@example.com", "David Brown", "1234567894"),
            get_or_create_customer(db, "emma.davis@example.com", "Emma Davis", "1234567895"),
            get_or_create_customer(db, "alex.martinez@example.com", "Alex Martinez", "1234567896"),
            get_or_create_customer(db, "olivia.garcia@example.com", "Olivia Garcia", "1234567897"),
        ]
        db.commit()

        # 6. Create Devices and Orders
        print("\n6. Creating Devices and Orders...")
        
        order_statuses = ["Pending", "Repairing", "Completed", "Cancelled"]
        models_list = [dell_xps, dell_latitude, hp_pavilion, lenovo_thinkpad, macbook_pro, 
                      asus_zenbook, dell_optiplex, hp_prodesk, ipad, samsung_tab, iphone, samsung_galaxy]
        
        orders_created = 0
        
        for i in range(50):  # Create 50 orders
            # Randomly select model and customer
            model = random.choice(models_list)
            customer = random.choice(customers)
            
            # Get appropriate problems based on device type
            if model.device_type_id == laptop_type.id:
                problems = laptop_problems
            elif model.device_type_id == desktop_type.id:
                problems = desktop_problems
            elif model.device_type_id == tablet_type.id:
                problems = tablet_problems
            else:
                problems = smartphone_problems
            
            problem = random.choice(problems)
            
            # Create device
            serial = f"SN{random.randint(100000, 999999)}"
            device = create_device(
                db,
                brand_id=model.brand_id,
                model_id=model.id,
                device_type_id=model.device_type_id,
                serial_number=serial,
                owner_id=customer.id,
                notes=f"Device owned by {customer.full_name}"
            )
            
            # Determine order details based on status
            status = random.choice(order_statuses)
            
            if status == "Completed":
                cost = Decimal(random.choice([150.00, 200.00, 250.00, 300.00, 350.00, 400.00]))
                discount = Decimal(random.choice([0.00, 10.00, 15.00, 20.00, 25.00]))
                note = "Repair completed successfully. Device tested and working."
                completed_at = datetime.now() - timedelta(days=random.randint(1, 30))
            elif status == "Cancelled":
                cost = Decimal(random.choice([100.00, 120.00, 150.00]))
                discount = Decimal(10.00)
                note = random.choice([
                    "Customer requested cancellation",
                    "Parts not available",
                    "Customer didn't respond"
                ])
                completed_at = None
            elif status == "Repairing":
                cost = Decimal(random.choice([180.00, 220.00, 280.00, 320.00]))
                discount = Decimal(random.choice([0.00, 10.00, 15.00]))
                note = "Technician is currently working on the device."
                completed_at = None
            else:  # Pending
                cost = Decimal(random.choice([100.00, 150.00, 200.00, 250.00]))
                discount = Decimal(random.choice([0.00, 10.00]))
                note = None
                completed_at = None
            
            total_cost = cost - discount
            
            # Create order
            order = Order(
                device_id=device.id,
                customer_id=customer.id,
                problem_id=problem.id,
                cost=cost,
                discount=discount,
                total_cost=total_cost,
                note=note,
                status=status,
                estimated_completion_date=datetime.now() + timedelta(days=random.randint(3, 14)),
                completed_at=completed_at
            )
            db.add(order)
            orders_created += 1
            
            if orders_created % 10 == 0:
                print(f"  * Created {orders_created} orders...")
                db.commit()
        
        db.commit()
        print(f"\n  * Total orders created: {orders_created}")

        # 7. Summary
        print("\n" + "="*80)
        print("SEEDING COMPLETED SUCCESSFULLY!")
        print("="*80)
        print("\nSummary:")
        print(f"  • Device Types: {db.query(DeviceType).count()}")
        print(f"  • Brands: {db.query(Brand).count()}")
        print(f"  • Models: {db.query(Model).count()}")
        print(f"  • Problems: {db.query(Problem).count()}")
        print(f"  • Customers: {len(customers)}")
        print(f"  • Devices: {db.query(Device).count()}")
        print(f"  • Orders: {db.query(Order).count()}")
        
        print("\n" + "="*80)
        print("\nYou can now test the API:")
        print("  GET http://localhost:8000/api/v1/orders")
        print("\nAll orders have:")
        print("  [+] Valid customer_id (linked to users)")
        print("  [+] Valid problem_id (linked to problems)")
        print("  [+] Valid device_id (with proper brand/model/type)")
        print("  [+] Realistic statuses (Pending, Repairing, Completed, Cancelled)")
        print("="*80 + "\n")

    except Exception as e:
        print(f"\n[x] Error: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    print("\nWARNING: This script will add data to your database.")
    response = input("Do you want to continue? (yes/no): ")
    
    if response.lower() in ['yes', 'y']:
        seed_complete_orders()
    else:
        print("Operation cancelled.")
