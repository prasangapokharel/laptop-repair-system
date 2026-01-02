#!/usr/bin/env python3
"""
Test script for Session 7 features:
1. Payment form with auto-calculation
2. Technician device management pages
"""

import requests
import json
import time
from typing import Dict, Any, List

BASE_URL = "http://localhost:8000/api/v1"

# Test credentials
ADMIN_PHONE = "1234567890"
ADMIN_PASSWORD = "admin123"

def get_auth_token(phone: str, password: str) -> str:
    """Get authentication token"""
    response = requests.post(
        f"{BASE_URL}/auth/login",
        json={"phone": phone, "password": password}
    )
    if response.status_code == 200:
        return response.json()["tokens"]["access_token"]
    else:
        print(f"Login failed: {response.text}")
        return None

def test_get_orders(token: str) -> List[Dict[str, Any]]:
    """Test getting orders for payment form"""
    print("\n=== TEST 1: Get Orders for Payment Form ===")
    response = requests.get(
        f"{BASE_URL}/orders",
        headers={"Authorization": f"Bearer {token}"},
        params={"limit": 10, "offset": 0}
    )
    
    if response.status_code == 200:
        data = response.json()
        orders = data.get('data', []) if isinstance(data, dict) else data
        print(f"✅ Orders loaded successfully")
        print(f"   Total orders: {len(orders)}")
        if orders:
            order = orders[0]
            print(f"   Sample order: ID={order['id']}, Total Cost={order.get('total_cost')}")
        return orders
    else:
        print(f"❌ Failed to get orders: {response.status_code}")
        print(response.text)
    return []

def test_payment_calculation(token: str, orders: List[Dict[str, Any]]) -> bool:
    """Test payment calculation scenarios"""
    print("\n=== TEST 2: Payment Auto-Calculation ===")
    
    if not orders:
        print("❌ No orders available for testing")
        return False
    
    order = orders[0]
    order_id = order['id']
    total_cost = float(order.get('total_cost', 0))
    
    print(f"   Testing with Order #{order_id}, Total Cost: रु{total_cost}")
    
    # Test scenario 1: Full payment
    print("\n   Scenario 1: Full Payment")
    print(f"   - Order Total: रु{total_cost}")
    print(f"   - Payment Amount: रु{total_cost}")
    print(f"   - Expected Due: रु 0.00")
    
    response = requests.post(
        f"{BASE_URL}/payments",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "order_id": order_id,
            "amount": str(total_cost),
            "due_amount": "0",
            "status": "Paid",
            "payment_method": "Cash",
            "transaction_id": None
        }
    )
    
    if response.status_code == 201:
        print(f"   ✅ Full payment recorded successfully")
    else:
        print(f"   ❌ Failed: {response.status_code} - {response.text}")
        return False
    
    # Test scenario 2: Partial payment (if possible)
    if len(orders) > 1:
        order2 = orders[1]
        order2_id = order2['id']
        total_cost2 = float(order2.get('total_cost', 0))
        
        if total_cost2 > 10:
            partial_amount = total_cost2 / 2
            due_amount = total_cost2 - partial_amount
            
            print(f"\n   Scenario 2: Partial Payment")
            print(f"   - Order Total: रु{total_cost2}")
            print(f"   - Payment Amount: रु{partial_amount:.2f}")
            print(f"   - Expected Due: रु{due_amount:.2f}")
            
            response = requests.post(
                f"{BASE_URL}/payments",
                headers={"Authorization": f"Bearer {token}"},
                json={
                    "order_id": order2_id,
                    "amount": str(partial_amount),
                    "due_amount": str(due_amount),
                    "status": "Partial",
                    "payment_method": "Card",
                    "transaction_id": f"TXN{int(time.time())}"
                }
            )
            
            if response.status_code == 201:
                print(f"   ✅ Partial payment recorded successfully")
            else:
                print(f"   ❌ Failed: {response.status_code} - {response.text}")
    
    return True

def test_device_types(token: str) -> bool:
    """Test device types endpoint"""
    print("\n=== TEST 3: Device Types Management ===")
    
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
        existing_types = types
    else:
        print(f"❌ Failed to get device types: {response.status_code}")
        return False
    
    # Create a new device type
    print("   Creating new device type...")
    payload = {
        "name": f"Test Device Type {int(time.time())}",
        "description": "Test description"
    }
    
    response = requests.post(
        f"{BASE_URL}/devices/types",
        headers={"Authorization": f"Bearer {token}"},
        json=payload
    )
    
    if response.status_code == 201:
        print(f"   ✅ Device type created successfully")
        return True
    else:
        print(f"   ❌ Failed to create device type: {response.status_code}")
        print(f"   Response: {response.text}")
        return False

def test_device_brands(token: str) -> bool:
    """Test device brands endpoint"""
    print("\n=== TEST 4: Device Brands Management ===")
    
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
        "name": f"Test Brand {int(time.time())}"
    }
    
    response = requests.post(
        f"{BASE_URL}/devices/brands",
        headers={"Authorization": f"Bearer {token}"},
        json=payload
    )
    
    if response.status_code == 201:
        print(f"   ✅ Brand created successfully")
        return True
    else:
        print(f"   ❌ Failed to create brand: {response.status_code}")
        print(f"   Response: {response.text}")
        return False

def test_device_models(token: str) -> bool:
    """Test device models endpoint"""
    print("\n=== TEST 5: Device Models Management ===")
    
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
                "name": f"Test Model {int(time.time())}",
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
   
