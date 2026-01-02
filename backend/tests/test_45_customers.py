"""
Comprehensive Test: 45+ Customers with Different Device Issues
Tests system flexibility and API robustness with real-world scenarios
"""
import asyncio
import httpx
import random
import os
import sys
from pathlib import Path
from datetime import datetime
from typing import List, Dict
from dotenv import load_dotenv

# Load environment variables
env_path = Path(__file__).parent.parent / '.env'
load_dotenv(env_path)

# Get BASE_URL from environment or use default
BASE_URL = os.getenv("BASE_URL", "http://localhost:8000")
# Remove trailing slash and /v1 if present
BASE_URL = BASE_URL.rstrip('/')
if BASE_URL.endswith('/v1'):
    BASE_URL = BASE_URL[:-3]
# Override to correct base
BASE_URL = "http://localhost:8000"


class CustomerIssueTest:
    def __init__(self):
        self.base_url = BASE_URL
        self.api_url = f"{BASE_URL}/api/v1"  # API URL with /api/v1 prefix
        self.access_token = None
        self.customers = []
        self.devices = []
        self.orders = []
        self.payments = []
        self.assigns = []
        self.role_ids = {}
        self.device_type_ids = {}
        self.brand_ids = {}
        self.model_ids = {}
        self.problem_ids = {}
        self.technician_ids = []
        self.passed = 0
        self.failed = 0
        self.total_customers = 45
        
        # Real-world device issues
        self.device_issues = [
            {"problem": "Screen Replacement", "cost": 150.00, "urgency": "High"},
            {"problem": "Battery Replacement", "cost": 80.00, "urgency": "Medium"},
            {"problem": "Keyboard Repair", "cost": 60.00, "urgency": "Medium"},
            {"problem": "Motherboard Repair", "cost": 300.00, "urgency": "High"},
            {"problem": "Software Installation", "cost": 50.00, "urgency": "Low"},
            {"problem": "Data Recovery", "cost": 200.00, "urgency": "High"},
            {"problem": "Virus Removal", "cost": 40.00, "urgency": "Medium"},
            {"problem": "Hardware Upgrade", "cost": 120.00, "urgency": "Low"},
            {"problem": "Charging Port Repair", "cost": 70.00, "urgency": "High"},
            {"problem": "Fan Replacement", "cost": 90.00, "urgency": "Medium"},
            {"problem": "Water Damage", "cost": 250.00, "urgency": "High"},
            {"problem": "OS Reinstallation", "cost": 60.00, "urgency": "Medium"},
            {"problem": "RAM Upgrade", "cost": 100.00, "urgency": "Low"},
            {"problem": "SSD Replacement", "cost": 180.00, "urgency": "Medium"},
            {"problem": "Display Cable Repair", "cost": 110.00, "urgency": "High"},
        ]
        
        # Device types and brands
        self.device_types = ["Laptop", "Desktop", "Tablet", "Smartphone"]
        self.brands = ["Apple", "Dell", "HP", "Lenovo", "Asus", "Acer", "Samsung", "Microsoft"]
        self.models = {
            "Laptop": ["MacBook Pro", "XPS 13", "ThinkPad", "ZenBook", "Pavilion"],
            "Desktop": ["iMac", "OptiPlex", "EliteDesk", "ThinkCentre", "VivoMini"],
            "Tablet": ["iPad", "Surface Pro", "Galaxy Tab", "Yoga Tab", "Transformer"],
            "Smartphone": ["iPhone", "Galaxy", "Pixel", "OnePlus", "Xiaomi"]
        }
        
        # Payment scenarios
        self.payment_scenarios = [
            {"type": "full_upfront", "amount": 1.0, "status": "Paid"},
            {"type": "partial", "amount": 0.5, "status": "Partial"},
            {"type": "due", "amount": 0.0, "status": "Due"},
            {"type": "installment_1", "amount": 0.3, "status": "Partial"},
            {"type": "installment_2", "amount": 0.3, "status": "Partial"},
            {"type": "final_payment", "amount": 0.4, "status": "Paid"},
        ]
        
        # Order statuses
        self.order_statuses = ["Pending", "Repairing", "Completed", "Cancelled"]
    
    async def print_progress(self, message: str):
        print(f"[PROGRESS] {message}")
    
    async def print_result(self, test_name: str, success: bool, details: str = ""):
        if success:
            print(f"[OK] {test_name}: {details}")
            self.passed += 1
        else:
            print(f"[ERROR] {test_name}: {details}")
            self.failed += 1
    
    async def setup_initial_data(self):
        """Setup initial data: roles, device types, brands, models"""
        async with httpx.AsyncClient() as client:
            # Register admin user
            admin_data = {
                "full_name": "Admin User",
                "phone": "9999999999",
                "email": "admin@repair.com",
                "password": "admin123"
            }
            
            try:
                response = await client.post(f"{self.api_url}/auth/register", json=admin_data)
                if response.status_code != 201:
                    # Try login
                    login_resp = await client.post(f"{self.api_url}/auth/login", json={
                        "phone": admin_data["phone"],
                        "password": admin_data["password"]
                    })
                    if login_resp.status_code == 200:
                        tokens = login_resp.json()['tokens']
                        self.access_token = tokens.get("access_token")
                else:
                    login_resp = await client.post(f"{self.api_url}/auth/login", json={
                        "phone": admin_data["phone"],
                        "password": admin_data["password"]
                    })
                    if login_resp.status_code == 200:
                        tokens = login_resp.json()['tokens']
                        self.access_token = tokens.get("access_token")
            except:
                pass
            
            if not self.access_token:
                # Use existing seeded user
                login_resp = await client.post(f"{self.api_url}/auth/login", json={
                    "phone": "9876543210",
                    "password": "password123"
                })
                if login_resp.status_code == 200:
                    tokens = login_resp.json()
                    self.access_token = tokens.get("access_token")
            
            if not self.access_token:
                return False
            
            headers = {"Authorization": f"Bearer {self.access_token}"}
            
            # Get roles
            roles_resp = await client.get(f"{self.api_url}/users/roles", headers=headers)
            if roles_resp.status_code == 200:
                roles = roles_resp.json()
                for role in roles:
                    self.role_ids[role["name"]] = role["id"]
            
            # Get device types
            types_resp = await client.get(f"{self.api_url}/devices/types", headers=headers)
            if types_resp.status_code == 200:
                device_types = types_resp.json()
                for dt in device_types:
                    self.device_type_ids[dt["name"]] = dt["id"]
            
            # Get brands
            brands_resp = await client.get(f"{self.api_url}/devices/brands", headers=headers)
            if brands_resp.status_code == 200:
                brands = brands_resp.json()
                for brand in brands:
                    self.brand_ids[brand["name"]] = brand["id"]
            
            # Get models
            models_resp = await client.get(f"{self.api_url}/devices/models", headers=headers)
            if models_resp.status_code == 200:
                models = models_resp.json()
                for model in models:
                    model_key = f"{model.get('brand_name', 'Unknown')}_{model['name']}"
                    self.model_ids[model_key] = model["id"]
            
            # Create technicians
            for i in range(5):
                tech_data = {
                    "full_name": f"Technician {i+1}",
                    "phone": f"888888888{i}",
                    "email": f"tech{i+1}@repair.com",
                    "password": "tech123"
                }
                try:
                    await client.post(f"{self.api_url}/auth/register", json=tech_data)
                    login_resp = await client.post(f"{self.api_url}/auth/login", json={
                        "phone": tech_data["phone"],
                        "password": tech_data["password"]
                    })
                    if login_resp.status_code == 200:
                        user_data = login_resp.json()
                        self.technician_ids.append(user_data.get("id", i+1))
                except:
                    self.technician_ids.append(i+1)
            
            return True
    
    async def create_customer_with_issue(self, customer_num: int):
        """Create a customer with a unique device issue"""
        async with httpx.AsyncClient() as client:
            import time
            unique_id = int(time.time() * 1000) + customer_num
            
            # Random customer data
            customer_data = {
                "full_name": f"Customer {customer_num}",
                "phone": f"777{customer_num:07d}",
                "email": f"customer{customer_num}@example.com",
                "password": "customer123"
            }
            
            # Register customer
            register_resp = None
            try:
                register_resp = await client.post(f"{self.api_url}/auth/register", json=customer_data)
                if register_resp.status_code not in [201, 400]:
                    return False
            except:
                pass
            
            # Login
            login_resp = await client.post(f"{self.api_url}/auth/login", json={
                "phone": customer_data["phone"],
                "password": customer_data["password"]
            })
            
            if login_resp.status_code != 200:
                return False
            
            tokens = login_resp.json()
            customer_token = tokens.get("access_token", "")
            customer_id = tokens.get("user_id") or (register_resp.json().get("id") if register_resp and register_resp.status_code == 201 else None)
            
            if not customer_id:
                # Get user ID from token or register response
                try:
                    user_resp = await client.get(f"{self.api_url}/users", headers={
                        "Authorization": f"Bearer {customer_token}"
                    }, params={"phone": customer_data["phone"]})
                    if user_resp.status_code == 200:
                        users = user_resp.json()
                        if users:
                            customer_id = users[0]["id"]
                except:
                    pass
            
            if not customer_id:
                return False
            
            headers = {"Authorization": f"Bearer {customer_token}"}
            
            # Select random device type and brand
            device_type_name = random.choice(self.device_types)
            brand_name = random.choice(self.brands)
            
            if device_type_name not in self.device_type_ids or brand_name not in self.brand_ids:
                return False
            
            device_type_id = self.device_type_ids[device_type_name]
            brand_id = self.brand_ids[brand_name]
            
            # Find matching model
            model_id = None
            for model_key, mid in self.model_ids.items():
                if brand_name in model_key and device_type_name in model_key:
                    model_id = mid
                    break
            
            if not model_id:
                # Use first available model
                model_id = list(self.model_ids.values())[0] if self.model_ids else None
            
            if not model_id:
                return False
            
            # Create device
            device_data = {
                "brand_id": brand_id,
                "model_id": model_id,
                "device_type_id": device_type_id,
                "serial_number": f"SN{unique_id}",
                "owner_id": customer_id,
                "notes": f"Device issue for customer {customer_num}"
            }
            
            device_resp = await client.post(f"{self.api_url}/devices", json=device_data, headers=headers)
            if device_resp.status_code not in [201, 400]:
                return False
            
            if device_resp.status_code == 201:
                device = device_resp.json()
                device_id = device["id"]
            else:
                # Device exists, get it
                devices_resp = await client.get(f"{self.api_url}/devices", headers=headers, params={
                    "serial_number": device_data["serial_number"]
                })
                if devices_resp.status_code == 200:
                    devices = devices_resp.json()
                    if devices:
                        device_id = devices[0]["id"]
                    else:
                        return False
                else:
                    return False
            
            # Select random issue
            issue = random.choice(self.device_issues)
            
            # Create order
            order_data = {
                "device_id": device_id,
                "customer_id": customer_id,
                "cost": str(issue["cost"]),
                "discount": str(random.uniform(0, 20)),
                "status": random.choice(["Pending", "Repairing"]),
                "note": f"Customer {customer_num}: {issue['problem']} - {issue['urgency']} priority"
            }
            
            order_resp = await client.post(f"{self.api_url}/orders", json=order_data, headers=headers)
            if order_resp.status_code != 201:
                return False
            
            order = order_resp.json()
            order_id = order["id"]
            
            # Assign technician (random)
            if self.technician_ids and random.random() > 0.3:  # 70% chance
                tech_id = random.choice(self.technician_ids)
                assign_data = {
                    "order_id": order_id,
                    "user_id": tech_id
                }
                assign_resp = await client.post(f"{self.api_url}/assigns", json=assign_data, headers=headers)
                # Don't fail if assignment fails (might already be assigned)
            
            # Create payment (various scenarios)
            payment_scenario = random.choice(self.payment_scenarios)
            payment_amount = issue["cost"] * payment_scenario["amount"]
            
            payment_data = {
                "order_id": order_id,
                "due_amount": str(issue["cost"]),
                "amount": str(payment_amount),
                "status": payment_scenario["status"],
                "payment_method": random.choice(["Cash", "Card", "Online"])
            }
            
            payment_resp = await client.post(f"{self.api_url}/payments", json=payment_data, headers=headers)
            # Don't fail if payment creation fails
            
            # Store customer data
            self.customers.append({
                "id": customer_id,
                "name": customer_data["full_name"],
                "phone": customer_data["phone"],
                "device_id": device_id,
                "order_id": order_id,
                "issue": issue,
                "status": order["status"]
            })
            
            return True
    
    async def test_bulk_customer_creation(self):
        """Test creating 45+ customers with different issues"""
        print("\n" + "="*70)
        print("BULK CUSTOMER TEST: 45+ Customers with Different Device Issues")
        print("="*70)
        
        # Setup initial data
        await self.print_progress("Setting up initial data...")
        setup_success = await self.setup_initial_data()
        if not setup_success:
            await self.print_result("Setup", False, "Failed to setup initial data")
            return False
        
        await self.print_result("Setup", True, "Initial data loaded")
        
        # Create customers in batches
        batch_size = 10
        total_batches = (self.total_customers + batch_size - 1) // batch_size
        
        for batch_num in range(total_batches):
            start_idx = batch_num * batch_size
            end_idx = min(start_idx + batch_size, self.total_customers)
            
            await self.print_progress(f"Creating customers {start_idx+1} to {end_idx}...")
            
            tasks = []
            for customer_num in range(start_idx + 1, end_idx + 1):
                tasks.append(self.create_customer_with_issue(customer_num))
            
            results = await asyncio.gather(*tasks, return_exceptions=True)
            
            success_count = sum(1 for r in results if r is True)
            await self.print_result(
                f"Batch {batch_num + 1}",
                success_count == len(results),
                f"{success_count}/{len(results)} customers created"
            )
        
        return len(self.customers) > 0
    
    async def test_order_status_updates(self):
        """Test updating order statuses for various customers"""
        print("\n" + "="*70)
        print("ORDER STATUS UPDATE TEST")
        print("="*70)
        
        if not self.customers:
            await self.print_result("Status Updates", False, "No customers to update")
            return False
        
        async with httpx.AsyncClient() as client:
            # Get admin token
            login_resp = await client.post(f"{self.api_url}/auth/login", json={
                "phone": "9876543210",
                "password": "password123"
            })
            if login_resp.status_code != 200:
                return False

            tokens = login_resp.json()
            headers = {"Authorization": f"Bearer {tokens.get('access_token', '')}"}

            # Update random orders to different statuses
            updated = 0
            for customer in random.sample(self.customers, min(20, len(self.customers))):
                new_status = random.choice(["Repairing", "Completed", "Cancelled"])
                update_data = {
                    "status": new_status,
                    "note": f"Status updated to {new_status}"
                }
                
                try:
                    update_resp = await client.patch(
                        f"{self.api_url}/orders/{customer['order_id']}",
                        json=update_data,
                        headers=headers
                    )
                    if update_resp.status_code == 200:
                        updated += 1
                except:
                    pass
            
            await self.print_result("Status Updates", updated > 0, f"{updated} orders updated")
            return updated > 0
    
    async def test_payment_processing(self):
        """Test various payment scenarios"""
        print("\n" + "="*70)
        print("PAYMENT PROCESSING TEST")
        print("="*70)
        
        if not self.customers:
            await self.print_result("Payments", False, "No customers for payment test")
            return False
        
        async with httpx.AsyncClient() as client:
            login_resp = await client.post(f"{self.api_url}/auth/login", json={
                "phone": "9876543210",
                "password": "password123"
            })
            if login_resp.status_code != 200:
                return False

            tokens = login_resp.json()
            headers = {"Authorization": f"Bearer {tokens.get('access_token', '')}"}

            # Get payments for random orders
            payments_created = 0
            for customer in random.sample(self.customers, min(15, len(self.customers))):
                # Create additional payments for partial payment scenarios
                if random.random() > 0.5:
                    payment_data = {
                        "order_id": customer["order_id"],
                        "due_amount": str(customer["issue"]["cost"]),
                        "amount": str(customer["issue"]["cost"] * 0.3),
                        "status": "Partial",
                        "payment_method": random.choice(["Cash", "Card"])
                    }
                    
                    try:
                        payment_resp = await client.post(
                            f"{self.api_url}/payments",
                            json=payment_data,
                            headers=headers
                        )
                        if payment_resp.status_code == 201:
                            payments_created += 1
                    except:
                        pass
            
            await self.print_result("Payments", payments_created > 0, f"{payments_created} additional payments created")
            return payments_created > 0
    
    async def test_query_operations(self):
        """Test querying orders, payments, devices"""
        print("\n" + "="*70)
        print("QUERY OPERATIONS TEST")
        print("="*70)
        
        async with httpx.AsyncClient() as client:
            login_resp = await client.post(f"{self.api_url}/auth/login", json={
                "phone": "9876543210",
                "password": "password123"
            })
            if login_resp.status_code != 200:
                return False

            tokens = login_resp.json()
            headers = {"Authorization": f"Bearer {tokens.get('access_token', '')}"}

            queries_passed = 0

            # Query orders by status
            for status in ["Pending", "Repairing", "Completed", "Cancelled"]:
                try:
                    orders_resp = await client.get(
                        f"{self.api_url}/orders",
                        headers=headers,
                        params={"status": status, "limit": 50}
                    )
                    if orders_resp.status_code == 200:
                        queries_passed += 1
                except:
                    pass
            
            # Query payments by status
            for status in ["Paid", "Due", "Partial", "Unpaid"]:
                try:
                    payments_resp = await client.get(
                        f"{self.api_url}/payments",
                        headers=headers,
                        params={"status": status, "limit": 50}
                    )
                    if payments_resp.status_code == 200:
                        queries_passed += 1
                except:
                    pass
            
            # Query devices
            try:
                devices_resp = await client.get(
                    f"{self.api_url}/devices",
                    headers=headers,
                    params={"limit": 50}
                )
                if devices_resp.status_code == 200:
                    queries_passed += 1
            except:
                pass
            
            await self.print_result("Queries", queries_passed > 5, f"{queries_passed} queries successful")
            return queries_passed > 5
    
    async def run_all_tests(self):
        """Run all tests"""
        print("\n" + "="*70)
        print("COMPREHENSIVE TEST: 45+ CUSTOMERS WITH DIFFERENT ISSUES")
        print("Testing System Flexibility and API Robustness")
        print("="*70)
        
        # Check if server is running
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(f"{BASE_URL}/health", timeout=10.0)
                if response.status_code != 200:
                    print(f"[ERROR] Backend server is not running on {self.base_url}")
                    print(f"Health check returned status: {response.status_code}")
                    return False
        except (httpx.ConnectError, httpx.ConnectTimeout, httpx.TimeoutException) as e:
            print(f"[ERROR] Backend server is not running on {self.base_url}")
            print(f"Connection error: {type(e).__name__}")
            print("Please start the backend server first:")
            print("  cd backend")
            print("  uvicorn main:app --reload --host 0.0.0.0 --port 8000")
            return False
        
        # Run tests
        await self.test_bulk_customer_creation()
        await self.test_order_status_updates()
        await self.test_payment_processing()
        await self.test_query_operations()
        
        # Print summary
        print("\n" + "="*70)
        print("TEST SUMMARY")
        print("="*70)
        print(f"Total Customers Created: {len(self.customers)}")
        print(f"Tests Passed: {self.passed}")
        print(f"Tests Failed: {self.failed}")
        print(f"Success Rate: {(self.passed / (self.passed + self.failed) * 100) if (self.passed + self.failed) > 0 else 0:.1f}%")
        print("="*70)
        
        # Print customer statistics
        if self.customers:
            print("\nCUSTOMER STATISTICS:")
            status_counts = {}
            for customer in self.customers:
                status = customer["status"]
                status_counts[status] = status_counts.get(status, 0) + 1
            
            for status, count in status_counts.items():
                print(f"  {status}: {count} customers")
        
        return self.failed == 0


async def main():
    tester = CustomerIssueTest()
    success = await tester.run_all_tests()
    exit(0 if success else 1)


if __name__ == "__main__":
    asyncio.run(main())

