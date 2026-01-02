#!/usr/bin/env python3
"""
Test script for Session 7 features:
1. Payment form with auto-calculation
2. Technician device management pages
"""

import requests
import json
from typing import Dict, Any

BASE_URL = "http://localhost:8000/api/v1"

# Test credentials
ADMIN_PHONE = "1234567890"
ADMIN_PASSWORD = "admin123"
TECHNICIAN_PHONE = "9876543210"
TECHNICIAN_PASSWORD = "password"

def get_auth_token(phone: str, password: str) -> str:
    """Get authentication token"""
    response = requests.post(
        f"{BASE_URL}/login",
        json={"phone": phone, "password": password}
    )
    if response.status_code == 200:
        return response.json()["token"]
    else:
        print(f"Login failed: {response.text}")
        return None

def test_get_orders(token: str) -> Dict[str, Any]:
    """Test getting orders for payment form"""
    print("\n=== Testing: Get Orders for Payment Form ===")
    response = requests.get(
        f"{BASE_URL}/orders",
        headers={"Authorization": f"Bearer {token}"},
        params={"limit": 10, "offset": 0}
    )
    
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Orders loaded successfully")
        print(f"   Total orders: {len(data.get('data', []))}")
        if data.get('data'):
            order = data['data'][0]
            print(f"   Sample order: ID={order['id']}, Total Cost={order.get('total_cost')}")
            return data['data']
    else:
        print(f"❌ Failed to get orders: {response.status_code}")
        print(response.text)
    return []

def test_create_payment(token: str, order_id: int, amount: float, due_amount: float) -> bool:
    """Test creating a payment"""
    print(f"\n=== Testing: Create Payment ===")
    print(f"   Order ID: {order_id}, Amount: {amount}, Due: {due_amount}")
    
    payload = {
        "order_id": order_id,
        "amount": str(amount),
        "due_amount": str(due_amount),
        "status": "Paid",
        "payment_method": "Cash",
        "transaction_id": None
    }
    
    response = requests.post(
        f"{BASE_URL}/payments",
        headers={"Authorization": f"Bearer {token}"},
        json=payload
    )
    
    if response.status_code == 201:
        print(f"✅ Payment created successfully")
        return True
    else:
        print(f"❌ Failed to create payment: {response.status_code}")
        print(response.text)
        return False

def test_device_types(token: str) -> bool:
    """Test device types endpoint"""
    print("\n=== Testing: Device Types ===")
    
    # Get device types
    response = requests.get(
        f"{BASE_URL}/devices/types",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    if response.status_code == 200:
        types = response.json()
        print(f"✅ Device types loaded: {len(types)} types")
        if types:
            print(f"   Sample: {types[0]}")
    else:
        print(f"❌ Failed to get device types: {response.status_code}")
        return False
    
    # Create a new device type
    print("   Creating new device type...")
    payload = {
        "name": f"Test Device Type {__import__('time').time()}",
        "description": "Test description"
    }
    
    response = requests.post(
        f"{BASE_URL}/devices/types",
        headers={"Authorization": f"Bearer {token}"},
        json=payload
    )
    
    if response.status_code == 201:
        print(f"✅ Device type created successfully")
        return True
    else:
        print(f"❌ Failed to create device type: {response.status_code}")
        print(response.text)
        return False

def test_device_brands(token: str) -> bool:
    """Test device brands endpoint"""
    print("\n=== Testing: Device Brands ===")
    
    # Get brands
    response = requests.get(
        f"{BASE_URL}/devices/brands",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    if response.status_code == 200:
        brands = response.json()
        print(f"✅ Device brands loaded: {len(brands)} brands")
        if brands:
            print(f"   Sample: {brands[0]}")
    else:
        print(f"❌ Failed to get brands: {response.status_code}")
        return False
    
    # Create a new brand
    print("   Creating new brand...")
    payload = {
        "name": f"Test Brand {__import__('time').time()}"
    }
    
    response = requests.post(
        f"{BASE_URL}/devices/brands",
        headers={"Authorization": f"Bearer {token}"},
        json=payload
    )
    
    if response.status_code == 201:
        print(f"✅ Brand created successfully")
        return True
    else:
        print(f"❌ Failed to create brand: {response.status_code}")
        print(response.text)
        return False

def test_device_models(token: str) -> bool:
    """Test device models endpoint"""
    print("\n=== Testing: Device Models ===")
    
    # Get models
    response = requests.get(
        f"{BASE_URL}/devices/models",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    if response.status_code == 200:
        models = response.json()
        print(f"✅ Device models loaded: {len(models)} models")
        if models:
            print(f"   Sample: {models[0]}")
    else:
        print(f"❌ Failed to get models: {response.status_code}")
        return False
    
    # Try to create a model (need brand and type first)
    # Get existing brand and type
    brands_resp = requests.get(
        f"{BASE_URL}/devices/brands",
        headers={"Authorization": f"Bearer {token}"}
    )
    types_resp = requests.get(
        f"{BASE_URL}/devices/types",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    if brands_resp.status_code == 200 and types_resp.status_code == 200:
        brands = brands_resp.json()
        types = types_resp.json()
        
        if brands and types:
            payload = {
                "name": f"Test Model {__import__('time').time()}",
                "brand_id": brands[0]["id"],
                "device_type_id": types[0]["id"]
            }
            
            print("   Creating new model...")
            response = requests.post(
                f"{BASE_URL}/devices/models",
                headers={"Authorization": f"Bearer {token}"},
                json=payload
            )
            
            if response.status_code == 201:
                print(f"✅ Model created successfully")
                return True
            else:
                print(f"❌ Failed to create model: {response.status_code}")
                print(response.text)
                return False
    
    return False

def main():
    print("=" * 60)
    print("SESSION 7 - TESTING NEW FEATURES")
    print("=" * 60)
    
    # Test with admin token
    print("\n[1/2] Testing with Admin credentials...")
    admin_token = get_auth_token(ADMIN_PHONE, ADMIN_PASSWORD)
    if not admin_token:
        print("Failed to get admin token")
        return
    
    print(f"✅ Admin authenticated")
    
    # Test payment form
    orders = test_get_orders(admin_token)
    if orders:
        order = orders[0]
        order_id = order['id']
        total_cost = float(order.get('total_cost', 0))
        
        # Test payment scenarios
        # Scenario 1: Full payment
        test_create_payment(admin_token, order_id, total_cost, 0)
        
        # Scenario 2: Partial payment
        if total_cost > 10:
            partial_amount = total_cost / 2
            due_amount = total_cost - partial_amount
            test_create_payment(admin_token, order_id, partial_amount, due_amount)
    
    # Test device management endpoints
    print("\n[2/2] Testing Device Management Endpoints...")
    test_device_types(admin_token)
    test_device_brands(admin_token)
    test_device_models(admin_token)
    
    print("\n" + "=" * 60)
    print("TESTING COMPLETE")
    print("=" * 60)

if __name__ == "__main__":
    main()
