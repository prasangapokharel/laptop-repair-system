# Complete Order Seed Script

## Overview
This script (`seed_complete_orders.py`) creates comprehensive test data for the laptop repair store management system with **proper relationships** between all entities.

## What It Creates

### 1. **Device Types** (4 types)
- Laptop
- Desktop  
- Tablet
- Smartphone

### 2. **Brands** (6 brands)
- Dell
- HP
- Lenovo
- Apple
- ASUS
- Samsung

### 3. **Models** (12 models)
Linked to specific brands and device types:
- **Laptops:** Dell XPS 13, Dell Latitude 7420, HP Pavilion 15, Lenovo ThinkPad X1 Carbon, MacBook Pro 14, ASUS ZenBook 14
- **Desktops:** Dell OptiPlex 7090, HP ProDesk 600
- **Tablets:** iPad Pro, Galaxy Tab S8
- **Smartphones:** iPhone 14 Pro, Galaxy S23

### 4. **Problems** (14 problems)
Linked to specific device types:
- **Laptop Problems:** Screen Broken, Battery Not Charging, Keyboard Malfunction, Overheating, Hard Drive Failure, Wi-Fi Not Working, No Power
- **Desktop Problems:** No Display, Blue Screen Error, Slow Performance
- **Tablet Problems:** Touch Screen Not Working, Battery Draining Fast
- **Smartphone Problems:** Screen Cracked, Charging Port Damaged

### 5. **Customers** (8 customers)
- John Doe (john.doe@example.com)
- Jane Smith (jane.smith@example.com)
- Mike Wilson (mike.wilson@example.com)
- Sarah Johnson (sarah.johnson@example.com)
- David Brown (david.brown@example.com)
- Emma Davis (emma.davis@example.com)
- Alex Martinez (alex.martinez@example.com)
- Olivia Garcia (olivia.garcia@example.com)

**Default Password:** `customer123`

### 6. **Devices** (50 devices)
Each device has:
- ✅ Valid brand_id
- ✅ Valid model_id  
- ✅ Valid device_type_id
- ✅ Unique serial number
- ✅ Owner (customer) assigned

### 7. **Orders** (50 orders)
Each order has:
- ✅ **Valid customer_id** - Linked to actual customer
- ✅ **Valid device_id** - Linked to actual device with proper brand/model
- ✅ **Valid problem_id** - Linked to appropriate problem for that device type
- ✅ **Realistic status** - Pending, Repairing, Completed, or Cancelled
- ✅ **Cost details** - cost, discount, total_cost
- ✅ **Notes** - Status-appropriate notes
- ✅ **Timestamps** - created_at, updated_at, completed_at (where applicable)

---

## How to Run

### Method 1: Direct Execution

```bash
cd backend
python scripts/seed_complete_orders.py
```

When prompted, type `yes` to proceed.

### Method 2: Using the migration runner

```bash
cd backend
python migration/run_seed.py
```

---

## Expected Output

```
================================================================================
SEEDING COMPLETE ORDER DATA
================================================================================

1. Creating Device Types...
  ✓ Created Device Type: Laptop
  ✓ Created Device Type: Desktop
  ✓ Created Device Type: Tablet
  ✓ Created Device Type: Smartphone

2. Creating Brands...
  ✓ Created Brand: Dell
  ✓ Created Brand: HP
  ...

3. Creating Models...
  ✓ Created Model: XPS 13
  ✓ Created Model: Latitude 7420
  ...

4. Creating Problems...
  ✓ Created Problem: Screen Broken
  ✓ Created Problem: Battery Not Charging
  ...

5. Creating Customers...
  ✓ Created Customer: John Doe (john.doe@example.com)
  ✓ Created Customer: Jane Smith (jane.smith@example.com)
  ...

6. Creating Devices and Orders...
  ✓ Created 10 orders...
  ✓ Created 20 orders...
  ✓ Created 30 orders...
  ✓ Created 40 orders...
  ✓ Created 50 orders...

  ✓ Total orders created: 50

================================================================================
SEEDING COMPLETED SUCCESSFULLY!
================================================================================

Summary:
  • Device Types: 4
  • Brands: 6
  • Models: 12
  • Problems: 14
  • Customers: 8
  • Devices: 50
  • Orders: 50

================================================================================

You can now test the API:
  GET http://localhost:8000/api/v1/orders

All orders have:
  ✓ Valid customer_id (linked to users)
  ✓ Valid problem_id (linked to problems)
  ✓ Valid device_id (with proper brand/model/type)
  ✓ Realistic statuses (Pending, Repairing, Completed, Cancelled)
================================================================================
```

---

## Verify the Data

### Check Orders API
```bash
curl http://localhost:8000/api/v1/orders?limit=5
```

**Expected Response:**
```json
{
  "items": [
    {
      "id": 1,
      "device_id": 1,
      "device_name": "Dell XPS 13",
      "customer_id": 1,
      "customer_name": "John Doe",
      "problem_id": 1,
      "problem_name": "Screen Broken",
      "cost": "250.00",
      "discount": "10.00",
      "total_cost": "240.00",
      "status": "Repairing",
      ...
    }
  ],
  "total": 50,
  "page": 1,
  "limit": 5
}
```

Notice all the **enriched fields** are now populated:
- ✅ `device_name` - Not null
- ✅ `customer_name` - Not null  
- ✅ `problem_name` - Not null

---

## Key Features

### 1. **Realistic Data Distribution**
- Orders have varied statuses (Pending, Repairing, Completed, Cancelled)
- Different device types (Laptops, Desktops, Tablets, Smartphones)
- Multiple brands and models
- Various problems appropriate to each device type

### 2. **Proper Relationships**
- Problems are only assigned to matching device types
  - Example: "Screen Broken" only for Laptops
  - Example: "Touch Screen Not Working" only for Tablets
- Devices have correct brand/model/type combinations
- Each order has a valid customer, device, and problem

### 3. **Status-Appropriate Data**
- **Completed orders:** Have `completed_at` timestamp and success notes
- **Cancelled orders:** Have cancellation notes
- **Repairing orders:** Have work-in-progress notes
- **Pending orders:** Have minimal notes

### 4. **Idempotent Execution**
The script uses `get_or_create` functions, so running it multiple times won't create duplicates for:
- Device Types
- Brands
- Models
- Problems
- Customers

But it **will create new**:
- Devices (with unique serial numbers)
- Orders

---

## Troubleshooting

### Issue: Import errors
**Solution:** Make sure you're running from the `backend` directory:
```bash
cd backend
python scripts/seed_complete_orders.py
```

### Issue: Database connection errors
**Solution:** Ensure your database is running and `.env` file is configured correctly.

### Issue: Foreign key constraint errors
**Solution:** Make sure migrations are up to date:
```bash
cd backend/migration
bash migrate.sh
```

---

## Clean Up (Optional)

To remove all test data:
```sql
TRUNCATE TABLE orders CASCADE;
TRUNCATE TABLE devices CASCADE;
TRUNCATE TABLE problems CASCADE;
TRUNCATE TABLE models CASCADE;
TRUNCATE TABLE brands CASCADE;
TRUNCATE TABLE device_types CASCADE;
DELETE FROM users WHERE role = 'customer';
```

---

## Next Steps

After running this script, you can:
1. ✅ Test the Orders API with properly enriched data
2. ✅ Test the frontend with real customer/device/problem relationships
3. ✅ Create assignments for technicians
4. ✅ Test order status transitions
5. ✅ Test filtering by customer, device type, or problem

---

## File Location
- **Script:** `backend/scripts/seed_complete_orders.py`
- **Documentation:** `backend/scripts/SEED_ORDERS_README.md`
