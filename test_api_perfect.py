#!/usr/bin/env python3
"""
Perfect Backend API Testing Script - All Endpoints
Tests all endpoints with proper authentication and error handling
"""

import requests
import json
from typing import Dict, List, Tuple, Optional
from datetime import datetime

# Configuration
BASE_URL = "http://localhost:8000"
API_PREFIX = "/api/v1"
TIMEOUT = 10

# Test results tracking
results = {
    "passed": 0,
    "failed": 0,
    "errors": 0,
    "tests": []
}

# Global variables
token = None
test_data = {
    "device_type_id": 1,
    "brand_id": 1,
    "model_id": 1,
    "device_id": 1,
    "user_id": 78,
    "order_id": 1,
    "payment_id": 1,
    "problem_id": 1,
    "cost_setting_id": 1,
    "role_id": 1,
}

def test_endpoint(name: str, method: str, endpoint: str, expected_status: int,
                  data: Optional[Dict] = None, token_param: Optional[str] = None) -> Tuple[bool, int, Optional[str]]:
    """Test a single endpoint"""
    url = f"{BASE_URL}{API_PREFIX}{endpoint}"
    headers = {"Content-Type": "application/json"}

    if token_param:
        headers["Authorization"] = f"Bearer {token_param}"

    try:
        if method == "GET":
            r = requests.get(url, headers=headers, timeout=TIMEOUT)
        elif method == "POST":
            r = requests.post(url, json=data, headers=headers, timeout=TIMEOUT)
        elif method == "PATCH":
            r = requests.patch(url, json=data, headers=headers, timeout=TIMEOUT)
        elif method == "DELETE":
            r = requests.delete(url, headers=headers, timeout=TIMEOUT)
        else:
            return False, 0, "Invalid method"

        passed = r.status_code == expected_status
        error_msg = None
        if not passed:
            try:
                error_msg = r.json().get("detail") or r.text[:100]
            except:
                error_msg = r.text[:100]

        results["tests"].append({
            "name": name,
            "method": method,
            "endpoint": endpoint,
            "expected": expected_status,
            "actual": r.status_code,
            "passed": passed,
            "error": error_msg
        })

        status_text = "PASS" if passed else "FAIL"
        print(f"[{status_text:4}] {r.status_code:3d} | {name:50} | {method:6} {endpoint}")

        if passed:
            results["passed"] += 1
        else:
            results["failed"] += 1

        return passed, r.status_code, error_msg

    except Exception as e:
        results["errors"] += 1
        results["tests"].append({
            "name": name,
            "method": method,
            "endpoint": endpoint,
            "expected": expected_status,
            "actual": "ERROR",
            "error": str(e),
            "passed": False
        })
        print(f"[ERR ] {name:50} | {method:6} {endpoint}")
        return False, 0, str(e)

print("\n" + "="*100)
print("LAPTOP REPAIR STORE - PERFECT API TESTING")
print(f"Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
print(f"Base URL: {BASE_URL}{API_PREFIX}")
print("="*100 + "\n")

# Step 1: Authentication
print("[STEP 1] AUTHENTICATION")
print("-"*100)

login_response = requests.post(f"{BASE_URL}{API_PREFIX}/auth/login", json={
    "phone": "9876543210",
    "password": "password123"
}, timeout=TIMEOUT)

if login_response.status_code == 200:
    token_response = login_response.json()
    token = token_response.get("tokens", {}).get("access_token")
    user_id = token_response.get("user", {}).get("id")
    test_data["user_id"] = user_id
    print(f"[PASS] Authentication successful")
    print(f"       Token obtained: {token[:40]}...")
    print(f"       User ID: {user_id}")
    print()
else:
    print(f"[FAIL] Authentication failed - Status {login_response.status_code}")
    print(f"       Response: {login_response.text}")
    print()

if not token:
    print("[ERROR] Cannot proceed without authentication token")
    exit(1)

# Step 2: Health Check
print("[STEP 2] HEALTH CHECK")
print("-"*100)
test_endpoint("Health Check", "GET", "/", 200)
print()

# Step 3: Authentication Endpoints
print("[STEP 3] AUTHENTICATION ENDPOINTS")
print("-"*100)
test_endpoint("Login Endpoint", "POST", "/auth/login", 200, {
    "phone": "9876543210",
    "password": "password123"
})
test_endpoint("Register New User", "POST", "/auth/register", 201, {
    "full_name": f"Test User {datetime.now().timestamp()}",
    "phone": f"988{int(datetime.now().timestamp()) % 10000000:07d}",
    "email": f"test_{datetime.now().timestamp()}@test.com",
    "password": "testpass123"
})
print()

# Step 4: Device Types
print("[STEP 4] DEVICE TYPES")
print("-"*100)
test_endpoint("List Device Types", "GET", "/devices/types", 200, token_param=token)
test_endpoint("Get Device Type 1", "GET", "/devices/types/1", 200, token_param=token)
test_endpoint("Create Device Type", "POST", "/devices/types", 201, {
    "name": f"DeviceType_{datetime.now().timestamp()}",
    "description": "Test device type"
}, token_param=token)
print()

# Step 5: Brands
print("[STEP 5] BRANDS")
print("-"*100)
test_endpoint("List Brands", "GET", "/devices/brands", 200, token_param=token)
test_endpoint("Get Brand 1", "GET", "/devices/brands/1", 200, token_param=token)
test_endpoint("Create Brand", "POST", "/devices/brands", 201, {
    "name": f"Brand_{datetime.now().timestamp()}"
}, token_param=token)
print()

# Step 6: Device Models
print("[STEP 6] DEVICE MODELS")
print("-"*100)
test_endpoint("List Models", "GET", "/devices/models", 200, token_param=token)
test_endpoint("Create Model", "POST", "/devices/models", 201, {
    "name": f"Model_{datetime.now().timestamp()}",
    "brand_id": 1,
    "device_type_id": 1
}, token_param=token)
print()

# Step 7: Devices
print("[STEP 7] DEVICES")
print("-"*100)
test_endpoint("List Devices", "GET", "/devices", 200, token_param=token)
test_endpoint("Get Device 1", "GET", "/devices/1", 200, token_param=token)
test_endpoint("Create Device", "POST", "/devices", 201, {
    "serial_number": f"SN_{datetime.now().timestamp()}",
    "brand_id": 1,
    "model_id": 1,
    "device_type_id": 1
}, token_param=token)
print()

# Step 8: Users
print("[STEP 8] USERS")
print("-"*100)
test_endpoint("List Users", "GET", "/users", 200, token_param=token)
test_endpoint("Get User 1", "GET", f"/users/{test_data['user_id']}", 200, token_param=token)
test_endpoint("List User Roles", "GET", "/users/roles", 200, token_param=token)
test_endpoint("Create User", "POST", "/users", 201, {
    "full_name": f"NewUser_{datetime.now().timestamp()}",
    "phone": f"989{int(datetime.now().timestamp()) % 10000000:07d}",
    "email": f"user_{datetime.now().timestamp()}@test.com",
    "password": "testpass123"
}, token_param=token)
print()

# Step 9: Problems
print("[STEP 9] PROBLEMS")
print("-"*100)
test_endpoint("List Problems", "GET", "/problems", 200, token_param=token)
test_endpoint("Get Problem 1", "GET", "/problems/1", 200, token_param=token)
test_endpoint("Create Problem", "POST", "/problems", 201, {
    "device_type_id": 1,
    "name": f"Problem_{datetime.now().timestamp()}",
    "description": "Test problem"
}, token_param=token)
print()

# Step 10: Cost Settings
print("[STEP 10] COST SETTINGS")
print("-"*100)
test_endpoint("List Cost Settings", "GET", "/cost-settings", 200, token_param=token)
test_endpoint("Get Cost Setting 1", "GET", "/cost-settings/1", 200, token_param=token)
test_endpoint("Create Cost Setting", "POST", "/cost-settings", 201, {
    "problem_id": 1,
    "cost": "5000"
}, token_param=token)
print()

# Step 11: Orders
print("[STEP 11] ORDERS")
print("-"*100)
test_endpoint("List Orders", "GET", "/orders", 200, token_param=token)
test_endpoint("Get Order 1", "GET", "/orders/1", 200, token_param=token)
test_endpoint("Create Order", "POST", "/orders", 201, {
    "device_id": 1,
    "cost": "5000",
    "status": "Pending"
}, token_param=token)
print()

# Step 12: Payments
print("[STEP 12] PAYMENTS")
print("-"*100)
test_endpoint("List Payments", "GET", "/payments", 200, token_param=token)
test_endpoint("Get Payment 1", "GET", "/payments/1", 200, token_param=token)
test_endpoint("Create Payment", "POST", "/payments", 201, {
    "order_id": 1,
    "amount": "2500",
    "status": "Partial"
}, token_param=token)
print()

# Step 13: Assignments
print("[STEP 13] ASSIGNMENTS")
print("-"*100)
test_endpoint("List Assignments", "GET", "/assigns", 200, token_param=token)
test_endpoint("Create Assignment", "POST", "/assigns", 201, {
    "order_id": 1,
    "assigned_to": test_data["user_id"]
}, token_param=token)
print()

# Step 14: Admin Dashboard
print("[STEP 14] ADMIN DASHBOARD")
print("-"*100)
test_endpoint("Admin Dashboard", "GET", "/admin/dashboard", 200, token_param=token)
print()

# Summary Report
print("\n" + "="*100)
print("TEST SUMMARY REPORT")
print("="*100)

total = results["passed"] + results["failed"]
pass_rate = (results["passed"] / total * 100) if total > 0 else 0

print(f"\nTotal Tests:     {total:3d}")
print(f"Passed:          {results['passed']:3d}")
print(f"Failed:          {results['failed']:3d}")
print(f"Errors:          {results['errors']:3d}")
print(f"Pass Rate:       {pass_rate:6.1f}%")

if results["failed"] > 0:
    print("\nFailed Tests Details:")
    print("-" * 100)
    for test in results["tests"]:
        if not test["passed"]:
            print(f"\n{test['method']:6} {test['endpoint']:40}")
            print(f"  Expected: {test['expected']}, Got: {test['actual']}")
            if test.get("error"):
                print(f"  Error: {test['error'][:100]}")

print("\n" + "="*100)
if pass_rate == 100:
    print("STATUS: ALL TESTS PASSED - SYSTEM 100% PERFECT")
elif pass_rate >= 90:
    print("STATUS: MOST TESTS PASSED - SYSTEM HIGHLY OPERATIONAL")
elif pass_rate >= 80:
    print("STATUS: MAJORITY TESTS PASSED - SYSTEM MOSTLY OPERATIONAL")
else:
    print("STATUS: SYSTEM NEEDS ATTENTION")
print("="*100 + "\n")

# Save report
report_file = "API_TEST_PERFECT_REPORT.md"
with open(report_file, 'w', encoding='utf-8') as f:
    f.write("# Laptop Repair Store - Perfect API Test Report\n\n")
    f.write(f"**Generated:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
    f.write(f"**Base URL:** {BASE_URL}{API_PREFIX}\n\n")
    f.write(f"## Summary\n")
    f.write(f"- Total Tests: {total}\n")
    f.write(f"- Passed: {results['passed']}\n")
    f.write(f"- Failed: {results['failed']}\n")
    f.write(f"- Errors: {results['errors']}\n")
    f.write(f"- Pass Rate: {pass_rate:.1f}%\n\n")
    f.write(f"## Status\n")
    if pass_rate == 100:
        f.write(f"**ALL TESTS PASSED - SYSTEM 100% PERFECT**\n\n")
    else:
        f.write(f"**Pass Rate: {pass_rate:.1f}%**\n\n")
    
    f.write(f"## Test Details\n\n")
    for test in results["tests"]:
        status = "PASS" if test["passed"] else "FAIL"
        f.write(f"### {status} - {test['method']} {test['endpoint']}\n")
        f.write(f"- Expected Status: {test['expected']}\n")
        f.write(f"- Actual Status: {test['actual']}\n")
        if test.get("error"):
            f.write(f"- Error: {test['error']}\n")
        f.write(f"\n")

print(f"Report saved: {report_file}")
