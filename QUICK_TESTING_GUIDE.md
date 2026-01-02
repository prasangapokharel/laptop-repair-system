# QUICK START TESTING GUIDE

## Prerequisites
- Backend running: `http://localhost:8000`
- Frontend running: `http://localhost:3000`
- Test account: Phone: `1234567890`, Password: `admin123`

---

## Test 1: Device Dropdown Now Shows Correctly ✅

### Steps
1. Navigate to `http://localhost:3000/auth/login`
2. Login with phone `1234567890`, password `admin123`
3. Go to `/admin/orders/add`
4. Click on "Device" dropdown
5. Scroll through the list - you should see 60+ devices like:
   - "Dell Dell_6211 Laptop_6211 - SN6531 • #1"
   - "Dell_710 Dell_710 - SN1019 • #2"
   - etc.

### Expected Result
✅ Device dropdown shows devices with brand, model, type, and serial number

---

## Test 2: Admin and Receptionist Use Identical Form ✅

### Admin Path
1. `/admin/orders/add` 
2. Create order with device, problem, customer
3. Verify form is clean and organized

### Receptionist Path
1. `/receptionist/orders/add`
2. Create same order
3. Verify form looks identical to admin

### Expected Result
✅ Both pages use same form layout and styling

---

## Test 3: Complete Order Creation Workflow ✅

### Steps
1. Login and go to `/admin/orders/add`
2. Fill in form:
   - **Device**: Select any device (e.g., "Dell - Laptop - SN6531")
   - **Problem**: Select a problem (optional, e.g., "Screen Replacement")
   - **Customer**: Select existing or create new
     - If new: Enter name "John Test" and phone "9999999999"
   - **Assign To**: Select technician (optional)
   - **Cost**: 1000.00
   - **Discount**: 100.00
   - **Note**: "Test order from UI"
3. Click "Create Order"
4. Should redirect to `/admin/orders` and show new order in list

### Expected Result
✅ Order created successfully with all data saved

---

## Test 4: Order Status Updates ✅

### Steps
1. Go to `/admin/orders`
2. Click on recently created order
3. Edit order status
4. Change from "Pending" to:
   - `Repairing` ✓ (valid)
   - `Completed` ✓ (valid)
   - `Cancelled` ✓ (valid)
   - `In Progress` ✗ (invalid - shows error)

### Valid Statuses
- `Pending` - Initial status
- `Repairing` - Being worked on
- `Completed` - Done
- `Cancelled` - Cancelled

### Expected Result
✅ Valid statuses update successfully
❌ Invalid statuses show error message

---

## Test 5: New Customer Creation ✅

### Steps
1. Go to `/admin/orders/add` or `/receptionist/orders/add`
2. Check "New Customer?" checkbox
3. Enter:
   - Name: "Jane Smith"
   - Phone: "1234567891"
4. Create order
5. Should auto-create customer with "Customer" role

### Expected Result
✅ New customer created and assigned to order

---

## Test 6: Technician Assignment ✅

### Steps
1. Create an order with "Assign To" field populated
2. Select a technician from dropdown
3. Submit order
4. Verify assignment created

### Expected Result
✅ Order assigned to technician

---

## Test 7: All Dropdowns Load Data ✅

### Locations to Test
- `/admin/orders/add` - Device, Problem, Customer, Assign To
- `/receptionist/orders/add` - Device, Problem, Customer, Assign To
- `/admin/devices/add` - Brand, Type, Model
- `/admin/users/add` - Role selection
- Any form with dropdowns

### Expected Result
✅ All dropdowns show 5+ items each

---

## Troubleshooting

### Device dropdown empty?
- Check that browser network shows 200 response for `/api/v1/devices`
- Check browser console for JavaScript errors
- Refresh page (hard refresh: Ctrl+Shift+R)

### Order creation fails?
- Check all required fields filled (Device is required)
- Check cost/discount are valid numbers
- Check console for error messages

### Status update fails?
- Only valid statuses: Pending, Repairing, Completed, Cancelled
- Check console for error messages

### New customer creation fails?
- Name and phone are required
- Phone should be unique
- Check console for error messages

---

## Key Fixes Applied

1. **Device Dropdown Fix** - Hook now handles both array and paginated API responses
2. **Code Deduplication** - Shared `OrderCreationForm` component used by both admin and receptionist
3. **Status Update Fix** - Valid statuses documented and enforced
4. **Error Handling** - Clear error messages for all operations

---

## Files to Know

- Form component: `/frontend/components/order-creation-form.tsx`
- Admin page: `/frontend/app/admin/orders/add/page.tsx`
- Receptionist page: `/frontend/app/receptionist/orders/add/page.tsx`
- Device hook: `/frontend/hooks/useDeviceList.ts`

---

## API Endpoints Reference

```
POST   /api/v1/orders                 - Create order
GET    /api/v1/orders                 - List orders
PATCH  /api/v1/orders/{id}            - Update order status
POST   /api/v1/assigns                - Create assignment
GET    /api/v1/devices                - Get devices (60+)
GET    /api/v1/problems               - Get problems (10+)
GET    /api/v1/users                  - Get users (46+)
POST   /api/v1/users                  - Create user
```

---

## Success Criteria

All tests should pass with ✅ marks:
- ✅ Device dropdown shows devices
- ✅ Forms are identical for admin and receptionist
- ✅ Order creation works end-to-end
- ✅ Status updates work with validation
- ✅ New customer creation works
- ✅ Technician assignment works
- ✅ All dropdowns populate with data

---

**Status**: All fixes implemented and tested. System ready for UAT.
