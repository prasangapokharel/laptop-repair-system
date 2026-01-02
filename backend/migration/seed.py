import asyncio
import sys
from pathlib import Path
from datetime import datetime, timedelta
from decimal import Decimal

sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy import text
from db import sync_engine
from core.config import settings
from utils.security import hash_password


async def seed_database():
    async with engine.begin() as conn:
        # 1. Seed Roles
        roles_data = [
            ("Admin", "System administrator with full access"),
            ("Technician", "Repair technician who handles device repairs"),
            ("Reception", "Reception staff who handles customer service"),
            ("Receptionist", "Reception staff who handles customer service"),
            ("Accountant", "Accountant who manages financial transactions"),
            ("Customer", "Customer who uses the service")
        ]
        
        print("Seeding roles...")
        role_ids = {}
        for name, description in roles_data:
            result = await conn.execute(
                text("""
                    INSERT INTO roles (name, description) 
                    VALUES (:name, :description)
                    ON DUPLICATE KEY UPDATE description = VALUES(description)
                """),
                {"name": name, "description": description}
            )
            # Get role ID
            role_result = await conn.execute(
                text("SELECT id FROM roles WHERE name = :name"),
                {"name": name}
            )
            role_row = role_result.fetchone()
            if role_row:
                role_ids[name] = role_row[0]
        
        # 2. Seed Device Types
        device_types_data = [
            ("Laptop", "Laptop computers"),
            ("Desktop", "Desktop computers"),
            ("Tablet", "Tablet devices"),
            ("Smartphone", "Smartphone devices")
        ]
        
        print("Seeding device types...")
        device_type_ids = {}
        for name, description in device_types_data:
            await conn.execute(
                text("""
                    INSERT INTO device_types (name, description) 
                    VALUES (:name, :description)
                    ON DUPLICATE KEY UPDATE description = VALUES(description)
                """),
                {"name": name, "description": description}
            )
            # Get device type ID
            dt_result = await conn.execute(
                text("SELECT id FROM device_types WHERE name = :name"),
                {"name": name}
            )
            dt_row = dt_result.fetchone()
            if dt_row:
                device_type_ids[name] = dt_row[0]
        
        # 3. Seed Brands
        brands_data = [
            "Apple", "Dell", "HP", "Lenovo", "Asus", 
            "Acer", "Samsung", "Microsoft", "Toshiba", "Sony"
        ]
        
        print("Seeding brands...")
        brand_ids = {}
        for name in brands_data:
            await conn.execute(
                text("""
                    INSERT INTO brands (name) 
                    VALUES (:name)
                    ON DUPLICATE KEY UPDATE name = VALUES(name)
                """),
                {"name": name}
            )
            # Get brand ID
            brand_result = await conn.execute(
                text("SELECT id FROM brands WHERE name = :name"),
                {"name": name}
            )
            brand_row = brand_result.fetchone()
            if brand_row:
                brand_ids[name] = brand_row[0]
        
        # 4. Seed Models (for each brand and device type combination)
        print("Seeding models...")
        model_ids = {}
        laptop_models = [
            ("MacBook Pro", "Apple"), ("MacBook Air", "Apple"),
            ("XPS 13", "Dell"), ("Inspiron 15", "Dell"),
            ("Pavilion", "HP"), ("EliteBook", "HP"),
            ("ThinkPad", "Lenovo"), ("IdeaPad", "Lenovo"),
            ("ZenBook", "Asus"), ("VivoBook", "Asus")
        ]
        
        for model_name, brand_name in laptop_models:
            if brand_name in brand_ids and "Laptop" in device_type_ids:
                await conn.execute(
                    text("""
                        INSERT INTO models (brand_id, name, device_type_id) 
                        VALUES (:brand_id, :name, :device_type_id)
                        ON DUPLICATE KEY UPDATE name = VALUES(name)
                    """),
                    {
                        "brand_id": brand_ids[brand_name],
                        "name": model_name,
                        "device_type_id": device_type_ids["Laptop"]
                    }
                )
                # Get model ID
                model_result = await conn.execute(
                    text("""
                        SELECT id FROM models 
                        WHERE brand_id = :brand_id AND name = :name AND device_type_id = :device_type_id
                    """),
                    {
                        "brand_id": brand_ids[brand_name],
                        "name": model_name,
                        "device_type_id": device_type_ids["Laptop"]
                    }
                )
                model_row = model_result.fetchone()
                if model_row:
                    model_ids[f"{brand_name}_{model_name}"] = model_row[0]
        
        # 5. Seed Problems
        print("Seeding problems...")
        problem_ids = {}
        problems_data = [
            ("Screen Replacement", "Screen is cracked or not working", "Laptop"),
            ("Battery Replacement", "Battery not holding charge", "Laptop"),
            ("Keyboard Repair", "Keys not working or stuck", "Laptop"),
            ("Motherboard Repair", "Motherboard issues", "Laptop"),
            ("Software Installation", "OS or software installation", "Laptop"),
            ("Data Recovery", "Recover lost data", "Laptop"),
            ("Virus Removal", "Remove malware and viruses", "Laptop"),
            ("Hardware Upgrade", "RAM or storage upgrade", "Laptop")
        ]
        
        for name, description, device_type_name in problems_data:
            if device_type_name in device_type_ids:
                await conn.execute(
                    text("""
                        INSERT INTO problems (device_type_id, name, description) 
                        VALUES (:device_type_id, :name, :description)
                        ON DUPLICATE KEY UPDATE description = VALUES(description)
                    """),
                    {
                        "device_type_id": device_type_ids[device_type_name],
                        "name": name,
                        "description": description
                    }
                )
                # Get problem ID
                prob_result = await conn.execute(
                    text("""
                        SELECT id FROM problems 
                        WHERE device_type_id = :device_type_id AND name = :name
                    """),
                    {
                        "device_type_id": device_type_ids[device_type_name],
                        "name": name
                    }
                )
                prob_row = prob_result.fetchone()
                if prob_row:
                    problem_ids[name] = prob_row[0]
        
        # 6. Seed Cost Settings
        print("Seeding cost settings...")
        cost_settings = [
            ("Screen Replacement", Decimal("150.00"), Decimal("100.00"), Decimal("200.00")),
            ("Battery Replacement", Decimal("80.00"), Decimal("50.00"), Decimal("120.00")),
            ("Keyboard Repair", Decimal("60.00"), Decimal("40.00"), Decimal("100.00")),
            ("Motherboard Repair", Decimal("300.00"), Decimal("200.00"), Decimal("500.00")),
            ("Software Installation", Decimal("50.00"), Decimal("30.00"), Decimal("80.00")),
            ("Data Recovery", Decimal("200.00"), Decimal("150.00"), Decimal("300.00")),
            ("Virus Removal", Decimal("40.00"), Decimal("25.00"), Decimal("60.00")),
            ("Hardware Upgrade", Decimal("120.00"), Decimal("80.00"), Decimal("200.00"))
        ]
        
        for problem_name, base_cost, min_cost, max_cost in cost_settings:
            if problem_name in problem_ids:
                await conn.execute(
                    text("""
                        INSERT INTO cost_settings (problem_id, base_cost, min_cost, max_cost, is_active) 
                        VALUES (:problem_id, :base_cost, :min_cost, :max_cost, :is_active)
                        ON DUPLICATE KEY UPDATE 
                            base_cost = VALUES(base_cost),
                            min_cost = VALUES(min_cost),
                            max_cost = VALUES(max_cost)
                    """),
                    {
                        "problem_id": problem_ids[problem_name],
                        "base_cost": float(base_cost),
                        "min_cost": float(min_cost),
                        "max_cost": float(max_cost),
                        "is_active": True
                    }
                )
        
        # 7. Seed Sample Users
        print("Seeding sample users...")
        users_data = [
            ("Admin User", "admin@repair.com", "1234567890", "admin123", True, True, ["Admin"]),
            ("John Technician", "tech@repair.com", "1234567891", "password123", True, False, ["Technician"]),
            ("Jane Reception", "reception@repair.com", "1234567892", "password123", True, False, ["Reception", "Receptionist"]),
            ("Bob Accountant", "accountant@repair.com", "1234567893", "password123", True, False, ["Accountant"]),
            ("Alice Customer", "customer@repair.com", "1234567894", "password123", True, False, ["Customer"]),
            ("Test User", "test@repair.com", "9876543210", "password123", True, False, ["Customer", "Reception", "Receptionist"]),
        ]
        
        user_ids = {}
        for full_name, email, phone, password, is_active, is_staff, roles_list in users_data:
            password_hash = hash_password(password)
            await conn.execute(
                text("""
                    INSERT INTO users (full_name, email, phone, password_hash, is_active, is_staff) 
                    VALUES (:full_name, :email, :phone, :password_hash, :is_active, :is_staff)
                    ON DUPLICATE KEY UPDATE 
                        full_name = VALUES(full_name),
                        email = VALUES(email),
                        password_hash = VALUES(password_hash)
                """),
                {
                    "full_name": full_name,
                    "email": email,
                    "phone": phone,
                    "password_hash": password_hash,
                    "is_active": is_active,
                    "is_staff": is_staff
                }
            )
            # Get user ID
            user_result = await conn.execute(
                text("SELECT id FROM users WHERE phone = :phone"),
                {"phone": phone}
            )
            user_row = user_result.fetchone()
            if user_row:
                user_id = user_row[0]
                user_ids[phone] = user_id
                
                # Assign roles
                for role_name in roles_list:
                    if role_name in role_ids:
                        await conn.execute(
                            text("""
                                INSERT INTO role_enroll (user_id, role_id) 
                                VALUES (:user_id, :role_id)
                                ON DUPLICATE KEY UPDATE user_id = VALUES(user_id)
                            """),
                            {
                                "user_id": user_id,
                                "role_id": role_ids[role_name]
                            }
                        )
        
        # 8. Seed Sample Devices
        print("Seeding sample devices...")
        device_count = 0
        if user_ids and brand_ids and model_ids and device_type_ids:
            # Get customer users
            customer_phone = "1234567894"  # Alice Customer
            test_user_phone = "9876543210"  # Test User
            
            # Create devices for Alice Customer
            if customer_phone in user_ids:
                customer_user_id = user_ids[customer_phone]
                sample_devices = [
                    ("SN001", "Laptop", "Apple", "MacBook Pro"),
                    ("SN002", "Laptop", "Dell", "XPS 13"),
                    ("SN003", "Laptop", "HP", "Pavilion")
                ]
                for serial, dt_name, brand_name, model_name in sample_devices:
                    if dt_name in device_type_ids and brand_name in brand_ids:
                        model_key = f"{brand_name}_{model_name}"
                        if model_key in model_ids:
                            await conn.execute(
                                text("""
                                    INSERT INTO devices (brand_id, model_id, device_type_id, serial_number, owner_id, notes) 
                                    VALUES (:brand_id, :model_id, :device_type_id, :serial_number, :owner_id, :notes)
                                    ON DUPLICATE KEY UPDATE owner_id = VALUES(owner_id), notes = VALUES(notes)
                                """),
                                {
                                    "brand_id": brand_ids[brand_name],
                                    "model_id": model_ids[model_key],
                                    "device_type_id": device_type_ids[dt_name],
                                    "serial_number": serial,
                                    "owner_id": customer_user_id,
                                    "notes": f"Sample {dt_name} device"
                                }
                            )
                            device_count += 1
            
            # Create devices for Test User (9876543210) - this is the main test user
            if test_user_phone in user_ids:
                test_user_id = user_ids[test_user_phone]
                test_devices = [
                    ("SN100", "Laptop", "Apple", "MacBook Pro"),
                    ("SN101", "Laptop", "Dell", "XPS 13"),
                    ("SN102", "Laptop", "HP", "Pavilion"),
                    ("SN103", "Laptop", "Lenovo", "ThinkPad"),
                ]
                for serial, dt_name, brand_name, model_name in test_devices:
                    if dt_name in device_type_ids and brand_name in brand_ids:
                        model_key = f"{brand_name}_{model_name}"
                        if model_key in model_ids:
                            await conn.execute(
                                text("""
                                    INSERT INTO devices (brand_id, model_id, device_type_id, serial_number, owner_id, notes) 
                                    VALUES (:brand_id, :model_id, :device_type_id, :serial_number, :owner_id, :notes)
                                    ON DUPLICATE KEY UPDATE owner_id = VALUES(owner_id), notes = VALUES(notes)
                                """),
                                {
                                    "brand_id": brand_ids[brand_name],
                                    "model_id": model_ids[model_key],
                                    "device_type_id": device_type_ids[dt_name],
                                    "serial_number": serial,
                                    "owner_id": test_user_id,
                                    "notes": f"Test device for user {test_user_phone}"
                                }
                            )
                            device_count += 1
        
        print("\n[SUCCESS] All seed data inserted successfully!")
        print(f"  - {len(roles_data)} roles")
        print(f"  - {len(device_types_data)} device types")
        print(f"  - {len(brands_data)} brands")
        print(f"  - {len(model_ids)} models")
        print(f"  - {len(problems_data)} problems")
        print(f"  - {len(cost_settings)} cost settings")
        print(f"  - {len(users_data)} users")
        print(f"  - {device_count} devices")
        print("\nTest User Credentials:")
        print("  Receptionist/Test User:")
        print("    Phone: 9876543210")
        print("    Password: password123")
        print("    Roles: Customer, Reception, Receptionist")
        print("  Technician User:")
        print("    Phone: 1234567891")
        print("    Password: password123")
        print("    Roles: Technician")


async def main():
    try:
        await seed_database()
        print("\n[SUCCESS] Database seeding completed!")
    except Exception as e:
        print(f"\n[ERROR] Error seeding database: {e}")
        import traceback
        traceback.print_exc()
        raise
    finally:
        await engine.dispose()


if __name__ == "__main__":
    asyncio.run(main())
