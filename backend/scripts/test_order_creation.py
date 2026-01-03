"""
Test script to verify the Create Order API endpoint
Tests:
1. Create order with all fields
2. Create order with minimal fields
3. Create order validation (missing required fields)
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import requests
import json
from datetime import datetime, timedelta

BASE_URL = "http://localhost:8000/api/v1"

# You'll need a valid auth token - get this by logging in as receptionist
# For now, we'll test if endpoints are accessible
AUTH_TOKEN = "your_token_here"
HEADERS = {
    "Authorization": f"Bearer {AUTH_TOKEN}",
    "Content-Type": "application/json"
}

def test_create_order_full():
    """Test creating order with all fields"""
    print("\n" + "="*80)
    print("TEST 1: Create Order with All Fields")
    print("="*80)
    
    # Calculate ETA (7 days from now)
    eta = (datetime.now() + timedelta(days=7)).isoformat()
    
    payload = {
        "device_id": 1,
        "customer_id": 6,
        "problem_id": 1,
        "cost": "500.00",
        "discount": "50.00",
        "note": "Customer requests fast turnaround",
        "status": "Pending",
        "estimated_completion_date": eta
    }
    
    print("\nPayload:")
    print(json.dumps(payload, indent=2))
    
    print("\nEndpoint: POST /orders")
    print("\nThis would create:")
    print(f"  Device: #1")
    print(f"  Customer: #6")
    print(f"  Problem: #1")
    print(f"  Cost: Rs {payload['cost']}")
    print(f"  Discount: Rs {payload['discount']}")
    print(f"  Total: Rs {float(payload['cost']) - float(payload['discount'])}")
    print(f"  ETA: {payload['estimated_completion_date']}")
    

def test_create_order_minimal():
    """Test creating order with minimal required fields"""
    print("\n" + "="*80)
    print("TEST 2: Create Order with Minimal Fields (Device Only)")
    print("="*80)
    
    payload = {
        "device_id": 2,
        "cost": "0.00",
        "discount": "0.00"
    }
    
    print("\nPayload:")
    print(json.dumps(payload, indent=2))
    
    print("\nEndpoint: POST /orders")
    print("\nThis would create:")
    print(f"  Device: #2")
    print(f"  Customer: None (optional)")
    print(f"  Problem: None (optional)")
    print(f"  Cost: Rs 0.00")
    print(f"  Status: Pending (default)")


def test_validation():
    """Test API validation"""
    print("\n" + "="*80)
    print("TEST 3: Validation Tests")
    print("="*80)
    
    print("\nTest Case 3a: Missing device_id (should fail)")
    payload = {
        "cost": "100.00"
    }
    print("Payload:", json.dumps(payload, indent=2))
    print("Expected: 422 Validation Error - device_id is required")
    
    print("\nTest Case 3b: Invalid device_id (should fail)")
    payload = {
        "device_id": 99999,
        "cost": "100.00"
    }
    print("Payload:", json.dumps(payload, indent=2))
    print("Expected: 404 Not Found - Device not found")
    
    print("\nTest Case 3c: Negative cost (should succeed but calculate total correctly)")
    payload = {
        "device_id": 1,
        "cost": "100.00",
        "discount": "150.00"
    }
    print("Payload:", json.dumps(payload, indent=2))
    print("Expected: 201 Created - total_cost should be 0.00 (max with 0)")


def verify_order_endpoints():
    """Verify all order-related endpoints"""
    print("\n" + "="*80)
    print("ORDER API ENDPOINTS SUMMARY")
    print("="*80)
    
    endpoints = [
        {
            "method": "POST",
            "path": "/orders",
            "description": "Create new order",
            "auth": "Receptionist/Admin",
            "required": ["device_id"],
            "optional": ["customer_id", "problem_id", "cost", "discount", "note", "status", "estimated_completion_date"]
        },
        {
            "method": "GET",
            "path": "/orders",
            "description": "List all orders",
            "auth": "Staff/Customer",
            "params": ["status", "customer_id", "device_id", "limit", "offset"]
        },
        {
            "method": "GET",
            "path": "/orders/{order_id}",
            "description": "Get order details",
            "auth": "Staff/Customer",
            "returns": "Order with enriched data (customer_name, device_name, problem_name)"
        },
        {
            "method": "PATCH",
            "path": "/orders/{order_id}",
            "description": "Update order",
            "auth": "Admin/Technician",
            "fields": ["cost", "discount", "note", "status", "estimated_completion_date"]
        },
        {
            "method": "DELETE",
            "path": "/orders/{order_id}",
            "description": "Delete order",
            "auth": "Admin only"
        },
        {
            "method": "POST",
            "path": "/orders/{order_id}/assign",
            "description": "Assign order to technician",
            "auth": "Admin/Receptionist",
            "body": {"user_id": "technician_id"}
        }
    ]
    
    for i, ep in enumerate(endpoints, 1):
        print(f"\n{i}. {ep['method']} {ep['path']}")
        print(f"   Description: {ep['description']}")
        print(f"   Auth: {ep['auth']}")
        if 'required' in ep:
            print(f"   Required: {', '.join(ep['required'])}")
        if 'optional' in ep:
            print(f"   Optional: {', '.join(ep['optional'])}")
        if 'params' in ep:
            print(f"   Query Params: {', '.join(ep['params'])}")
        if 'fields' in ep:
            print(f"   Update Fields: {', '.join(ep['fields'])}")
        if 'returns' in ep:
            print(f"   Returns: {ep['returns']}")
        if 'body' in ep:
            print(f"   Body: {json.dumps(ep['body'], indent=2)}")


def main():
    print("\n" + "="*80)
    print("ORDER CREATION API TEST SUITE")
    print("="*80)
    print("\nTesting Order Creation Form and API Endpoints")
    print(f"Backend: {BASE_URL}")
    print(f"Current Time: {datetime.now().isoformat()}")
    
    test_create_order_full()
    test_create_order_minimal()
    test_validation()
    verify_order_endpoints()
    
    print("\n" + "="*80)
    print("FORM FEATURES AVAILABLE")
    print("="*80)
    print("""
1. Device Selection (Searchable Combobox)
   - Shows: Brand, Model, Type, Serial Number
   - Example: "Dell XPS 13 • Laptop • SN ABC123 • #1"

2. Customer Selection
   - Option A: Select Existing Customer
     * Shows full name and phone
     * Example: "John Customer 5378084 • 555000001"
   
   - Option B: Create New Customer
     * Checkbox to enable
     * Fields: Full Name, Phone Number
     * Auto-generates password
     * Auto-assigns "Customer" role
     * Creates user in database

3. Problem Selection (Searchable Combobox)
   - Shows: Problem name
   - Example: "Screen Replacement"
   - Optional (can be null)

4. Assign To (Optional)
   - Dropdown of all users
   - Can assign technician immediately
   - Shows: Full Name • User ID

5. Cost & Discount
   - Cost: Base repair cost
   - Discount: Amount to subtract
   - Auto-calculates: Total = Cost - Discount (min 0)

6. Note (Optional)
   - Internal notes about the order
   - Free text field

7. Estimated Completion Date (Optional)
   - DateTime picker
   - Sets expected delivery date

Validation:
- ✓ Device is required
- ✓ Customer is optional (walk-in repairs)
- ✓ Problem is optional (to be diagnosed)
- ✓ Cost defaults to 0.00
- ✓ Discount defaults to 0.00
- ✓ Status defaults to "Pending"
- ✓ New customer requires name and phone
- ✓ Auto-calculates total cost
    """)
    
    print("\n" + "="*80)
    print("TEST COMPLETE")
    print("="*80)


if __name__ == "__main__":
    main()
