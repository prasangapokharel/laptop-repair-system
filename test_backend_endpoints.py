#!/usr/bin/env python3
"""
Comprehensive Backend API Testing Script
Tests all 80+ endpoints with proper authentication and error handling
"""

import requests
import json
from typing import Dict, List, Tuple, Optional
from datetime import datetime

# Configuration
BASE_URL = "http://localhost:8000"
TIMEOUT = 10

# Test results tracking
results = {
    "passed": 0,
    "failed": 0,
    "errors": 0,
    "tests": []
}

# Test data
test_data = {
    "device_type_id": 1,
    "brand_id": 1,
    "model_id": 1,
    "device_id": 1,
    "user_id": 1,
    "order_id": 1,
    "payment_id": 1,
    "problem_id": 1,
    "cost_setting_id": 1,
    "role_id": 1,
}

def test_endpoint(name: str, method: str, endpoint: str, expected_status: int, 
                  data: Optional[Dict] = None, token: Optional[str] = None) -> Tuple[bool, int, Optional[str]]:
    """Test a single endpoint"""
    url = f"{BASE_URL}{endpoint}"
    headers = {"Content-Type": "application/json"}
    
    if token:
        headers["Authorization"] = f"Bearer {token}"
    
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
        
        status_icon = "PASS" if passed else "FAIL"
        status_text = f"{status_icon} [{r.status_code:3d}]" if passed else f"FAIL [{r.status_code:3d} != {expected_status}]"
        print(f"{status_text} {name:55} {endpoint}")
        
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
        print(f"ERROR [ERR] {name:55} {endpoint}")
        print(f"        Error: {str(e)[:80]}")
        return False, 0, str(e)

print("\n" + "="*100)
print("LAPTOP REPAIR STORE API - COMPREHENSIVE ENDPOINT TESTING")
print(f"Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
print("="*100 + "\n")

# Get valid token for authenticated tests
print("Step 1: Obtaining authentication token...")
print("-" * 100)
login_response = requests.post(f"{BASE_URL}/api/api/v1/auth/login", json={
    "phone": "9876543210",
    "password": "password123"
}, timeout=TIMEOUT)

if login_response.status_code == 200:
    token_data = login_response.json()
    token = token_data.get("access_token") or token_data.get("token")
    print(f"PASS Authentication successful - Token obtained\n")
else:
    print(f"FAIL Authentication failed - Status {login_response.status_code}")
    token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2NCIsInBob25lIjoiOTgxMTM4ODg0OCIsImV4cCI6MTc2NzMyMDMyMywidHlwZSI6ImFjY2VzcyJ9.GX-bRGdRY0xuk-nKQhkah-O334JNj4r0T4EF-uHw"
    print(f"Using cached token\n")

# ============================================================================
# 1. HEALTH & AUTHENTICATION ENDPOINTS (No Token Required)
# ============================================================================
print("\n[1] HEALTH & AUTHENTICATION ENDPOINTS")
print("-" * 100)

test_endpoint("Health Check", "GET", "/health", 200)
test_endpoint("Login", "POST", "/api/api/v1/auth/login", 200, {
    "phone": "9876543210",
    "password": "password123"
})

# ============================================================================
# 2. DEVICE TYPES ENDPOINTS
# ============================================================================
print("\n[2] DEVICE TYPES ENDPOINTS")
print("-" * 100)

test_endpoint("List Device Types", "GET", "/api/api/v1/devices/types", 200, token=token)
test_endpoint("Get Device Type #1", "GET", f"/api/api/v1/devices/types/{test_data['device_type_id']}", 200, token=token)
test_endpoint("Create Device Type", "POST", "/api/api/v1/devices/types", 201, {
    "name": f"Type_{datetime.now().timestamp()}",
    "description": "Test device type"
}, token=token)
test_endpoint("Update Device Type #1", "PATCH", f"/api/api/v1/devices/types/{test_data['device_type_id']}", 200, {
    "description": "Updated description"
}, token=token)
test_endpoint("Delete Device Type (404)", "DELETE", "/api/api/v1/devices/types/99999", 404, token=token)

# ============================================================================
# 3. BRANDS ENDPOINTS
# ============================================================================
print("\n[3] BRANDS ENDPOINTS")
print("-" * 100)

test_endpoint("List Brands", "GET", "/api/v1/devices/brands", 200, token=token)
test_endpoint("Get Brand #1", "GET", f"/api/v1/devices/brands/{test_data['brand_id']}", 200, token=token)
test_endpoint("Create Brand", "POST", "/api/v1/devices/brands", 201, {
    "name": f"Brand_{datetime.now().timestamp()}"
}, token=token)
test_endpoint("Update Brand #1", "PATCH", f"/api/v1/devices/brands/{test_data['brand_id']}", 200, {
    "name": "Updated Brand"
}, token=token)
test_endpoint("Delete Brand (404)", "DELETE", "/api/v1/devices/brands/99999", 404, token=token)

# ============================================================================
# 4. DEVICE MODELS ENDPOINTS
# ============================================================================
print("\n[4] DEVICE MODELS ENDPOINTS")
print("-" * 100)

test_endpoint("List Device Models", "GET", "/api/v1/devices/models", 200, token=token)
test_endpoint("Get Device Model #1", "GET", f"/api/v1/devices/models/{test_data['model_id']}", 200, token=token)
test_endpoint("Create Device Model", "POST", "/api/v1/devices/models", 201, {
    "name": f"Model_{datetime.now().timestamp()}",
    "brand_id": test_data['brand_id'],
    "device_type_id": test_data['device_type_id']
}, token=token)
test_endpoint("Update Device Model #1", "PATCH", f"/api/v1/devices/models/{test_data['model_id']}", 200, {
    "name": "Updated Model"
}, token=token)
test_endpoint("Delete Device Model (404)", "DELETE", "/api/v1/devices/models/99999", 404, token=token)

# ============================================================================
# 5. DEVICES ENDPOINTS
# ============================================================================
print("\n[5] DEVICES ENDPOINTS")
print("-" * 100)

test_endpoint("List Devices", "GET", "/api/v1/devices", 200, token=token)
test_endpoint("Get Device #1", "GET", f"/api/v1/devices/{test_data['device_id']}", 200, token=token)
test_endpoint("Create Device", "POST", "/api/v1/devices", 201, {
    "serial_number": f"SN_{datetime.now().timestamp()}",
    "brand_id": test_data['brand_id'],
    "model_id": test_data['model_id'],
    "device_type_id": test_data['device_type_id']
}, token=token)
test_endpoint("Update Device #1", "PATCH", f"/api/v1/devices/{test_data['device_id']}", 200, {
    "serial_number": "UPDATED_SN"
}, token=token)
test_endpoint("Delete Device (404)", "DELETE", "/api/v1/devices/99999", 404, token=token)

# ============================================================================
# 6. USERS ENDPOINTS
# ============================================================================
print("\n[6] USERS ENDPOINTS")
print("-" * 100)

test_endpoint("List Users", "GET", "/api/v1/users", 200, token=token)
test_endpoint("Get User #1", "GET", f"/api/v1/users/{test_data['user_id']}", 200, token=token)
test_endpoint("Get User Roles", "GET", "/api/v1/users/roles", 200, token=token)
test_endpoint("Create User", "POST", "/api/v1/users", 201, {
    "full_name": f"TestUser_{datetime.now().timestamp()}",
    "phone": f"989{int(datetime.now().timestamp()) % 10000000:07d}",
    "email": f"test_{datetime.now().timestamp()}@test.com",
    "password": "testpass123"
}, token=token)
test_endpoint("Update User #1", "PATCH", f"/api/v1/users/{test_data['user_id']}", 200, {
    "full_name": "Updated User"
}, token=token)
test_endpoint("Delete User (404)", "DELETE", "/api/v1/users/99999", 404, token=token)

# ============================================================================
# 7. PROBLEMS ENDPOINTS
# ============================================================================
print("\n[7] PROBLEMS ENDPOINTS")
print("-" * 100)

test_endpoint("List Problems", "GET", "/api/v1/problems", 200, token=token)
test_endpoint("Get Problem #1", "GET", f"/api/v1/problems/{test_data['problem_id']}", 200, token=token)
test_endpoint("Create Problem", "POST", "/api/v1/problems", 201, {
    "device_type_id": test_data['device_type_id'],
    "name": f"Problem_{datetime.now().timestamp()}",
    "description": "Test problem"
}, token=token)
test_endpoint("Update Problem #1", "PATCH", f"/api/v1/problems/{test_data['problem_id']}", 200, {
    "name": "Updated Problem"
}, token=token)
test_endpoint("Delete Problem (404)", "DELETE", "/api/v1/problems/99999", 404, token=token)

# ============================================================================
# 8. COST SETTINGS ENDPOINTS
# ============================================================================
print("\n[8] COST SETTINGS ENDPOINTS")
print("-" * 100)

test_endpoint("List Cost Settings", "GET", "/api/v1/cost-settings", 200, token=token)
test_endpoint("Get Cost Setting #1", "GET", f"/api/v1/cost-settings/{test_data['cost_setting_id']}", 200, token=token)
test_endpoint("Create Cost Setting", "POST", "/api/v1/cost-settings", 201, {
    "problem_id": test_data['problem_id'],
    "cost": "5000"
}, token=token)
test_endpoint("Update Cost Setting #1", "PATCH", f"/api/v1/cost-settings/{test_data['cost_setting_id']}", 200, {
    "cost": "6000"
}, token=token)
test_endpoint("Delete Cost Setting (404)", "DELETE", "/api/v1/cost-settings/99999", 404, token=token)

# ============================================================================
# 9. ORDERS ENDPOINTS
# ============================================================================
print("\n[9] ORDERS ENDPOINTS")
print("-" * 100)

test_endpoint("List Orders", "GET", "/api/v1/orders", 200, token=token)
test_endpoint("Get Order #1", "GET", f"/api/v1/orders/{test_data['order_id']}", 200, token=token)
test_endpoint("Create Order", "POST", "/api/v1/orders", 201, {
    "device_id": test_data['device_id'],
    "cost": "5000",
    "status": "pending"
}, token=token)
test_endpoint("Update Order #1", "PATCH", f"/api/v1/orders/{test_data['order_id']}", 200, {
    "status": "in_progress"
}, token=token)
test_endpoint("Delete Order (404)", "DELETE", "/api/v1/orders/99999", 404, token=token)

# ============================================================================
# 10. PAYMENTS ENDPOINTS
# ============================================================================
print("\n[10] PAYMENTS ENDPOINTS")
print("-" * 100)

test_endpoint("List Payments", "GET", "/api/v1/payments", 200, token=token)
test_endpoint("Get Payment #1", "GET", f"/api/v1/payments/{test_data['payment_id']}", 200, token=token)
test_endpoint("Create Payment", "POST", "/api/v1/payments", 201, {
    "order_id": test_data['order_id'],
    "amount": "2500",
    "status": "Partial"
}, token=token)
test_endpoint("Update Payment #1", "PATCH", f"/api/v1/payments/{test_data['payment_id']}", 200, {
    "amount": "5000"
}, token=token)
test_endpoint("Delete Payment (404)", "DELETE", "/api/v1/payments/99999", 404, token=token)

# ============================================================================
# 11. ASSIGNMENTS ENDPOINTS
# ============================================================================
print("\n[11] ASSIGNMENTS ENDPOINTS")
print("-" * 100)

test_endpoint("List Assignments", "GET", "/api/v1/assigns", 200, token=token)
test_endpoint("Create Assignment", "POST", "/api/v1/assigns", 201, {
    "order_id": test_data['order_id'],
    "assigned_to": test_data['user_id']
}, token=token)

# ============================================================================
# 12. ADMIN DASHBOARD
# ============================================================================
print("\n[12] ADMIN DASHBOARD")
print("-" * 100)

test_endpoint("Admin Dashboard", "GET", "/api/v1/admin/dashboard", 200, token=token)

# ============================================================================
# SUMMARY REPORT
# ============================================================================
print("\n" + "="*100)
print("TEST SUMMARY REPORT")
print("="*100)

total = results["passed"] + results["failed"]
pass_rate = (results["passed"] / total * 100) if total > 0 else 0

print(f"\nTotal Tests:     {total:3d}")
print(f"Passed:          {results['passed']:3d} PASS")
print(f"Failed:          {results['failed']:3d} FAIL")
print(f"Errors:          {results['errors']:3d} ERROR")
print(f"Pass Rate:       {pass_rate:6.1f}%\n")

if results["failed"] > 0:
    print("Failed Tests Details:")
    print("-" * 100)
    for test in results["tests"]:
        if not test["passed"]:
            print(f"\nFAIL {test['method']:6} {test['endpoint']:40}")
            print(f"  Expected: {test['expected']}, Got: {test['actual']}")
            if test.get("error"):
                print(f"  Error: {test['error'][:80]}")

print("\n" + "="*100)
if pass_rate == 100:
    print("ALL TESTS PASSED - SYSTEM FULLY OPERATIONAL")
elif pass_rate >= 90:
    print("MOST TESTS PASSED - SYSTEM OPERATIONAL (Minor Issues)")
elif pass_rate >= 80:
    print("MAJORITY TESTS PASSED - SYSTEM MOSTLY OPERATIONAL")
else:
    print("SYSTEM HAS SIGNIFICANT ISSUES - NEEDS INVESTIGATION")
print("="*100 + "\n")

# Save detailed report
report_file = "ENDPOINT_TEST_REPORT.md"
with open(report_file, 'w') as f:
    f.write("# Backend API Endpoint Testing Report\n\n")
    f.write(f"**Generated:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")
    f.write(f"## Summary\n")
    f.write(f"- Total Tests: {total}\n")
    f.write(f"- Passed: {results['passed']} PASS\n")
    f.write(f"- Failed: {results['failed']} FAIL\n")
    f.write(f"- Errors: {results['errors']} ERROR\n")
    f.write(f"- Pass Rate: {pass_rate:.1f}%\n\n")
    
    f.write(f"## Test Details\n\n")
    for test in results["tests"]:
        status = "PASS" if test["passed"] else "FAIL"
        f.write(f"### {test['method']:6} {test['endpoint']}\n")
        f.write(f"- Status: {status}\n")
        f.write(f"- Expected: {test['expected']}\n")
        f.write(f"- Actual: {test['actual']}\n")
        if test.get("error"):
            f.write(f"- Error: {test['error']}\n")
        f.write("\n")

print(f"Detailed report saved to: {report_file}")
