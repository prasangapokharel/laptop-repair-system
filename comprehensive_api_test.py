#!/usr/bin/env python
"""
Comprehensive API Testing Script
Tests all critical workflows for the Device Repair Management System
"""

import requests
import json
from datetime import datetime
from typing import Dict, Any, List, Tuple

# Configuration
BASE_URL = "http://localhost:8000/api/v1"
HEADERS_JSON = {"Content-Type": "application/json"}

# Test data
TEST_RESULTS = {
    "passed": [],
    "failed": [],
    "warnings": []
}

# Token storage
access_token = None

def print_test_header(title: str):
    print(f"\n{'='*80}")
    print(f"  {title}")
    print(f"{'='*80}")

def print_test(test_name: str, result: bool, details: str = ""):
    status = "✅ PASS" if result else "❌ FAIL"
    print(f"{status} | {test_name}")
    if details:
        print(f"       {details}")
    
    if result:
        TEST_RESULTS["passed"].append(test_name)
    else:
        TEST_RESULTS["failed"].append(test_name)

def print_warning(test_name: str, message: str):
    print(f"⚠️  WARNING | {test_name}")
    print(f"       {message}")
    TEST_RESULTS["warnings"].append(f"{test_name}: {message}")

def test_login() -> Tuple[bool, str]:
    """Test login and get access token"""
    print_test_header("TEST 1: AUTHENTICATION")
    
    login_data = {
        "phone": "1234567890",
        "password": "admin123"
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/auth/login",
            json=login_data,
            headers=HEADERS_JSON
        )
        
        success = response.status_code == 200
        print_test("Login with admin credentials", success, f"Status: {response.status_code}")
        
        if success:
            data = response.json()
            global access_token
            access_token = data["tokens"]["access_token"]
            
            # Verify response structure
            assert "user" in data
            assert "tokens" in data
            assert data["user"]["role"]["name"] == "Admin"
            print_test("Admin role verification", True, f"Role: {data['user']['role']['name']}")
            
            return True, access_token
        else:
            print(f"Response: {response.text}")
            return False, ""
    
    except Exception as e:
        print_test("Login endpoint", False, str(e))
        return False, ""

def get_headers() -> Dict[str, str]:
    """Get headers with auth token"""
    return {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {access_token}"
    }

def test_devices_list():
    """Test devices list endpoint"""
    print_test_header("TEST 2: DEVICE MANAGEMENT")
    
    try:
        response = requests.get(
            f"{BASE_URL}/devices?limit=10&offset=0",
            headers=get_headers()
        )
        
        success = response.status_code == 200
        print_test("Fetch devices list", success, f"Status: {response.status_code}")
        
        if success:
            devices = response.json()
            print_test("Devices response is list", isinstance(devices, list), f"Count: {len(devices)}")
            
            if len(devices) > 0:
                device = devices[0]
                required_fields = ["id", "brand_id", "model_id", "device_type_id", "serial_number"]
                has_fields = all(field in device for field in required_fields)
                print_test("Device response structure", has_fields, f"Fields present: {list(device.keys())}")
                
                return devices
            else:
                print_warning("Devices list", "No devices found in database")
                return []
    
    except Exception as e:
        print_test("Devices endpoint", False, str(e))
        return []

def test_device_brands() -> List:
    """Test device brands endpoint"""
    try:
        response = requests.get(
            f"{BASE_URL}/device-brands",
            headers=get_headers()
        )
        
        success = response.status_code == 200
        print_test("Fetch device brands", success, f"Status: {response.status_code}")
        
        if success:
            brands = response.json()
            print_test("Brands response is list", isinstance(brands, list), f"Count: {len(brands)}")
            return brands
        else:
            print_warning("Device brands", f"Status: {response.status_code}")
            return []
    
    except Exception as e:
        print_test("Device brands endpoint", False, str(e))
        return []

def test_device_types() -> List:
    """Test device types endpoint"""
    try:
        response = requests.get(
            f"{BASE_URL}/device-types",
            headers=get_headers()
        )
        
        success = response.status_code == 200
        print_test("Fetch device types", success, f"Status: {response.status_code}")
        
        if success:
            types = response.json()
            print_test("Types response is list", isinstance(types, list), f"Count: {len(types)}")
            return types
        else:
            print_warning("Device types", f"Status: {response.status_code}")
            return []
    
    except Exception as e:
        print_test("Device types endpoint", False, str(e))
        return []

def test_problems_list() -> List:
    """Test problems list endpoint"""
    print_test_header("TEST 3: PROBLEM MANAGEMENT")
    
    try:
        response = requests.get(
            f"{BASE_URL}/problems?limit=10&offset=0",
            headers=get_headers()
        )
        
        success = response.status_code == 200
        print_test("Fetch problems list", success, f"Status: {response.status_code}")
        
        if success:
            problems = response.json()
            print_test("Problems response is list", isinstance(problems, list), f"Count: {len(problems)}")
            
            if len(problems) > 0:
                problem = problems[0]
                required_fields = ["id", "title", "description", "cost"]
                has_fields = all(field in problem for field in required_fields)
                print_test("Problem response structure", has_fields, f"Fields: {list(problem.keys())}")
                return problems
            else:
                print_warning("Problems list", "No problems found in database")
                return []
    
    except Exception as e:
        print_test("Problems endpoint", False, str(e))
    
    return []

def test_users_list() -> List:
    """Test users list endpoint"""
    print_test_header("TEST 4: USER MANAGEMENT")
    
    try:
        response = requests.get(
            f"{BASE_URL}/users?limit=10&offset=0",
            headers=get_headers()
        )
        
        success = response.status_code == 200
        print_test("Fetch users list", success, f"Status: {response.status_code}")
        
        if success:
            users = response.json()
            print_test("Users response is list", isinstance(users, list), f"Count: {len(users)}")
            
            if len(users) > 0:
                user = users[0]
                required_fields = ["id", "full_name", "phone", "is_active"]
                has_fields = all(field in user for field in required_fields)
                print_test("User response structure", has_fields, f"Fields: {list(user.keys())}")
                return users
            else:
                print_warning("Users list", "No users found in database")
                return []
    
    except Exception as e:
        print_test("Users endpoint", False, str(e))
    
    return []

def test_create_order(device_id: int, problem_id: int, customer_id: int):
    """Test order creation"""
    print_test_header("TEST 5: ORDER MANAGEMENT")
    
    order_data = {
        "device_id": device_id,
        "problem_id": problem_id,
        "customer_id": customer_id,
        "cost": 500.00,
        "discount": 50.00,
        "status": "Pending",
        "estimated_completion_date": None,
        "note": "Test order created by API test"
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/orders",
            json=order_data,
            headers=get_headers()
        )
        
        success = response.status_code == 201
        print_test("Create order", success, f"Status: {response.status_code}")
        
        if success:
            order = response.json()
            print_test("Order response has id", "id" in order, f"Order ID: {order.get('id')}")
            print_test("Order status", order.get("status") == "Pending", f"Status: {order.get('status')}")
            return order
        else:
            print(f"Response: {response.text}")
            return None
    
    except Exception as e:
        print_test("Create order", False, str(e))
        return None

def test_orders_list() -> List[Dict]:
    """Test orders list endpoint"""
    try:
        response = requests.get(
            f"{BASE_URL}/orders?limit=10&offset=0",
            headers=get_headers()
        )
        
        success = response.status_code == 200
        print_test("Fetch orders list", success, f"Status: {response.status_code}")
        
        if success:
            orders = response.json()
            print_test("Orders response is list", isinstance(orders, list), f"Count: {len(orders)}")
            return orders
        else:
            print_warning("Orders list", f"Status: {response.status_code}")
            return []
    
    except Exception as e:
        print_test("Orders endpoint", False, str(e))
        return []

def test_create_user():
    """Test user creation"""
    print_test_header("TEST 6: CREATE USER")
    
    import time
    phone = f"999{int(time.time() % 1000000):06d}"  # Generate unique phone
    
    user_data = {
        "full_name": "Test User",
        "phone": phone,
        "email": "testuser@repair.com",
        "password": "testpass123"
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/users",
            json=user_data,
            headers=get_headers()
        )
        
        success = response.status_code == 201
        print_test("Create new user", success, f"Status: {response.status_code}")
        
        if success:
            user = response.json()
            print_test("User creation response", "id" in user, f"User ID: {user.get('id')}")
            return user
        else:
            print(f"Response: {response.text}")
            return None
    
    except Exception as e:
        print_test("Create user", False, str(e))
        return None

def test_get_user(user_id: int):
    """Test get user by id"""
    try:
        response = requests.get(
            f"{BASE_URL}/users/{user_id}",
            headers=get_headers()
        )
        
        success = response.status_code == 200
        print_test("Get user by ID", success, f"Status: {response.status_code}")
        
        if success:
            user = response.json()
            print_test("User detail response", "id" in user, f"User: {user.get('full_name')}")
            return user
        else:
            print_warning("Get user", f"Status: {response.status_code}")
            return None
    
    except Exception as e:
        print_test("Get user", False, str(e))
        return None

def test_update_user(user_id: int):
    """Test user update"""
    update_data = {
        "full_name": "Updated Test User"
    }
    
    try:
        response = requests.patch(
            f"{BASE_URL}/users/{user_id}",
            json=update_data,
            headers=get_headers()
        )
        
        success = response.status_code == 200
        print_test("Update user", success, f"Status: {response.status_code}")
        
        if success:
            user = response.json()
            print_test("Updated user name", user.get("full_name") == "Updated Test User")
            return user
        else:
            print_warning("Update user", f"Status: {response.status_code}")
            return None
    
    except Exception as e:
        print_test("Update user", False, str(e))
        return None

def test_assignments(order_id: int, user_id: int):
    """Test assignment creation"""
    print_test_header("TEST 7: ASSIGNMENT MANAGEMENT")
    
    assignment_data = {
        "order_id": order_id,
        "user_id": user_id,
        "status": "Assigned",
        "notes": "Test assignment"
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/assignments",
            json=assignment_data,
            headers=get_headers()
        )
        
        success = response.status_code == 201
        print_test("Create assignment", success, f"Status: {response.status_code}")
        
        if success:
            assignment = response.json()
            print_test("Assignment created", "id" in assignment)
            return assignment
        else:
            print(f"Response: {response.text}")
            return None
    
    except Exception as e:
        print_test("Create assignment", False, str(e))
        return None

def test_cost_settings():
    """Test cost settings endpoint"""
    print_test_header("TEST 8: COST SETTINGS")
    
    try:
        response = requests.get(
            f"{BASE_URL}/cost-settings",
            headers=get_headers()
        )
        
        success = response.status_code == 200
        print_test("Fetch cost settings", success, f"Status: {response.status_code}")
        
        if success:
            settings = response.json()
            print_test("Cost settings is list", isinstance(settings, list), f"Count: {len(settings)}")
            return settings
        else:
            print_warning("Cost settings", f"Status: {response.status_code}")
            return []
    
    except Exception as e:
        print_test("Cost settings endpoint", False, str(e))
        return []

def print_summary():
    """Print test summary"""
    print_test_header("TEST SUMMARY")
    
    total = len(TEST_RESULTS["passed"]) + len(TEST_RESULTS["failed"])
    passed = len(TEST_RESULTS["passed"])
    failed = len(TEST_RESULTS["failed"])
    warnings = len(TEST_RESULTS["warnings"])
    
    print(f"\nTotal Tests: {total}")
    print(f"✅ Passed: {passed}")
    print(f"❌ Failed: {failed}")
    print(f"⚠️  Warnings: {warnings}")
    
    if failed > 0:
        print(f"\nFailed Tests:")
        for test in TEST_RESULTS["failed"]:
            print(f"  ❌ {test}")
    
    if warnings > 0:
        print(f"\nWarnings:")
        for warning in TEST_RESULTS["warnings"]:
            print(f"  ⚠️  {warning}")
    
    success_rate = (passed / total * 100) if total > 0 else 0
    print(f"\nSuccess Rate: {success_rate:.1f}%")
    
    if failed == 0:
        print("\n✅ ALL TESTS PASSED!")
        return True
    else:
        print(f"\n❌ {failed} TESTS FAILED")
        return False

def main():
    """Run all tests"""
    print("🚀 Starting Comprehensive API Tests")
    print(f"Base URL: {BASE_URL}")
    print(f"Time: {datetime.now().isoformat()}")
    
    # Test 1: Login
    success, token = test_login()
    if not success:
        print("\n❌ Login failed, cannot continue tests")
        return
    
    # Test 2: Devices
    devices = test_devices_list()
    brands = test_device_brands()
    types = test_device_types()
    
    # Test 3: Problems
    problems = test_problems_list()
    
    # Test 4: Users
    users = test_users_list()
    
    # Test 5: Create and list orders
    order = None
    if devices and problems and users:
        order = test_create_order(
            device_id=devices[0]["id"],
            problem_id=problems[0]["id"],
            customer_id=users[0]["id"]
        )
    
    orders = test_orders_list()
    
    # Test 6: User management
    new_user = test_create_user()
    if new_user:
        test_get_user(new_user["id"])
        test_update_user(new_user["id"])
    
    # Test 7: Assignments
    if order and new_user:
        test_assignments(order["id"], new_user["id"])
    
    # Test 8: Cost settings
    test_cost_settings()
    
    # Print summary
    success = print_summary()
    
    # Save results to file
    with open("test_results.json", "w") as f:
        json.dump(TEST_RESULTS, f, indent=2)
    
    print("\nResults saved to test_results.json")

if __name__ == "__main__":
    main()
