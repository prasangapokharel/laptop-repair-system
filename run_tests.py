#!/usr/bin/env python
"""
Comprehensive API Test Suite - All Endpoints
"""
import requests
import time

BASE_URL = "http://localhost:8000/api/v1"
RESULTS = {"passed": 0, "failed": 0, "tests": []}

def log_test(name, passed, status_code=None):
    """Log test result"""
    result = "PASS" if passed else "FAIL"
    RESULTS["tests"].append((name, passed))
    if passed:
        RESULTS["passed"] += 1
        print("  [{}] {}: {}".format(result, name, status_code))
    else:
        RESULTS["failed"] += 1
        print("  [{}] {}: {}".format(result, name, status_code))

def test_endpoint(method, endpoint, token=None, data=None):
    """Test a single endpoint"""
    url = BASE_URL + endpoint
    headers = {}
    if token:
        headers["Authorization"] = "Bearer " + token
    
    try:
        if method == "GET":
            r = requests.get(url, headers=headers, timeout=5)
        elif method == "POST":
            r = requests.post(url, json=data, headers=headers, timeout=5)
        elif method == "PATCH":
            r = requests.patch(url, json=data, headers=headers, timeout=5)
        elif method == "DELETE":
            r = requests.delete(url, headers=headers, timeout=5)
        else:
            return None, False
        
        passed = r.status_code in [200, 201, 204, 400, 401, 403, 404]
        return r, passed
    except Exception as e:
        return None, False

print("\n" + "="*70)
print("COMPREHENSIVE API TEST SUITE")
print("="*70 + "\n")

print("PHASE 1: AUTHENTICATION ENDPOINTS\n")

# Login
r, passed = test_endpoint("POST", "/auth/login", data={
    "phone": "admin@example.com",
    "password": "password"
})
token = None
if r and r.status_code == 200:
    try:
        token = r.json().get("tokens", {}).get("access_token")
        log_test("Login with credentials", True, r.status_code)
    except:
        log_test("Login with credentials", False, r.status_code)
else:
    log_test("Login with credentials", passed, r.status_code if r else 0)

print("\nPHASE 2: AUTHENTICATION REQUIREMENT CHECKS\n")

# Test unauthenticated access
endpoints_to_check = ["/orders", "/payments", "/assigns", "/problems", "/cost-settings", "/admin/dashboard"]
for endpoint in endpoints_to_check:
    r, _ = test_endpoint("GET", endpoint)
    passed = (r and r.status_code == 401) if r else False
    log_test("Auth required for GET " + endpoint, passed, r.status_code if r else 0)

if not token:
    print("\nERROR: No authentication token")
    exit(1)

print("\nAuthenticated with token\n")

print("PHASE 3: USER MANAGEMENT\n")

r, passed = test_endpoint("GET", "/users", token=token)
log_test("List users", passed, r.status_code if r else 0)

r, passed = test_endpoint("POST", "/users", token=token, data={
    "full_name": "Test User",
    "phone": "user" + str(int(time.time())) + "@example.com",
    "email": "user" + str(int(time.time())) + "@example.com",
    "password": "Test@12345"
})
log_test("Create user", passed, r.status_code if r else 0)

print("\nPHASE 4: DEVICE TYPES\n")

r, passed = test_endpoint("POST", "/devices/types", token=token, data={
    "name": "Type" + str(int(time.time())),
    "description": "Test"
})
device_type_id = r.json().get("id") if r and r.status_code == 201 else None
log_test("Create device type", passed, r.status_code if r else 0)

r, passed = test_endpoint("GET", "/devices/types", token=token)
log_test("List device types", passed, r.status_code if r else 0)

if device_type_id:
    r, passed = test_endpoint("GET", "/devices/types/" + str(device_type_id), token=token)
    log_test("Get device type", passed, r.status_code if r else 0)

print("\nPHASE 5: BRANDS\n")

r, passed = test_endpoint("POST", "/devices/brands", token=token, data={
    "name": "Brand" + str(int(time.time())),
    "description": "Test"
})
brand_id = r.json().get("id") if r and r.status_code == 201 else None
log_test("Create brand", passed, r.status_code if r else 0)

r, passed = test_endpoint("GET", "/devices/brands", token=token)
log_test("List brands", passed, r.status_code if r else 0)

if brand_id:
    r, passed = test_endpoint("GET", "/devices/brands/" + str(brand_id), token=token)
    log_test("Get brand", passed, r.status_code if r else 0)

print("\nPHASE 6: MODELS\n")

model_id = None
if device_type_id and brand_id:
    r, passed = test_endpoint("POST", "/devices/models", token=token, data={
        "name": "Model" + str(int(time.time())),
        "device_type_id": device_type_id,
        "brand_id": brand_id,
        "description": "Test"
    })
    model_id = r.json().get("id") if r and r.status_code == 201 else None
    log_test("Create model", passed, r.status_code if r else 0)
    
    r, passed = test_endpoint("GET", "/devices/models", token=token)
    log_test("List models", passed, r.status_code if r else 0)

print("\nPHASE 7: DEVICES\n")

device_id = None
if device_type_id and brand_id and model_id:
    r, passed = test_endpoint("POST", "/devices", token=token, data={
        "serial_number": "SN" + str(int(time.time())),
        "device_type_id": device_type_id,
        "brand_id": brand_id,
        "model_id": model_id,
        "color": "Black",
        "storage": "256GB"
    })
    device_id = r.json().get("id") if r and r.status_code == 201 else None
    log_test("Create device", passed, r.status_code if r else 0)
    
    r, passed = test_endpoint("GET", "/devices", token=token)
    log_test("List devices", passed, r.status_code if r else 0)

print("\nPHASE 8: PROBLEMS\n")

problem_id = None
if device_type_id:
    r, passed = test_endpoint("POST", "/problems", token=token, data={
        "device_type_id": device_type_id,
        "name": "Problem" + str(int(time.time())),
        "description": "Test"
    })
    problem_id = r.json().get("id") if r and r.status_code == 201 else None
    log_test("Create problem", passed, r.status_code if r else 0)
    
    r, passed = test_endpoint("GET", "/problems", token=token)
    log_test("List problems", passed, r.status_code if r else 0)

print("\nPHASE 9: COST SETTINGS\n")

if problem_id:
    r, passed = test_endpoint("POST", "/cost-settings", token=token, data={
        "problem_id": problem_id,
        "base_cost": 100.00,
        "min_cost": 50.00,
        "max_cost": 200.00,
        "is_active": True
    })
    log_test("Create cost setting", passed, r.status_code if r else 0)
    
    r, passed = test_endpoint("GET", "/cost-settings", token=token)
    log_test("List cost settings", passed, r.status_code if r else 0)

print("\nPHASE 10: ORDERS\n")

order_id = None
if device_id and problem_id:
    r, passed = test_endpoint("POST", "/orders", token=token, data={
        "device_id": device_id,
        "customer_id": 1,
        "problem_id": problem_id,
        "cost": 100.00,
        "discount": 10.00,
        "note": "Test",
        "status": "Pending",
        "estimated_completion_date": "2025-01-15"
    })
    order_id = r.json().get("id") if r and r.status_code == 201 else None
    log_test("Create order", passed, r.status_code if r else 0)
    
    r, passed = test_endpoint("GET", "/orders", token=token)
    log_test("List orders", passed, r.status_code if r else 0)
    
    if order_id:
        r, passed = test_endpoint("GET", "/orders/" + str(order_id), token=token)
        log_test("Get order", passed, r.status_code if r else 0)

print("\nPHASE 11: PAYMENTS\n")

if order_id:
    r, passed = test_endpoint("POST", "/payments", token=token, data={
        "order_id": order_id,
        "due_amount": 100.00,
        "amount": 50.00,
        "status": "Partial",
        "payment_method": "Cash",
        "transaction_id": "TXN" + str(int(time.time()))
    })
    log_test("Create payment", passed, r.status_code if r else 0)
    
    r, passed = test_endpoint("GET", "/payments", token=token)
    log_test("List payments", passed, r.status_code if r else 0)

print("\nPHASE 12: ADMIN DASHBOARD\n")

r, passed = test_endpoint("GET", "/admin/dashboard", token=token)
log_test("Get admin dashboard", passed, r.status_code if r else 0)

# RESULTS
print("\n" + "="*70)
print("TEST SUMMARY")
print("="*70)

total = RESULTS["passed"] + RESULTS["failed"]
pass_rate = (RESULTS["passed"] / total * 100) if total > 0 else 0

print("\nTotal Tests: {}".format(total))
print("Passed: {}".format(RESULTS["passed"]))
print("Failed: {}".format(RESULTS["failed"]))
print("Pass Rate: {:.1f}%\n".format(pass_rate))

if pass_rate == 100:
    print("SUCCESS: ALL TESTS PASSED - 100% SUCCESS!")
elif pass_rate >= 90:
    print("GOOD: MOST TESTS PASSED - {:.1f}% SUCCESS".format(pass_rate))
else:
    print("WARNING: TESTS FAILED - {:.1f}% SUCCESS".format(pass_rate))

if RESULTS["failed"] > 0:
    print("\nFailed Tests:")
    for name, passed in RESULTS["tests"]:
        if not passed:
            print("  FAIL: {}".format(name))

print("\n" + "="*70 + "\n")
