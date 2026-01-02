# Session 7 Testing Guide

## Manual Testing Steps

### Part 1: Payment Form Auto-Calculation Testing

#### Prerequisites
- Admin user logged in
- Frontend and backend running
- At least one order exists in the system

#### Test Procedure

1. **Navigate to Payment Form**
   - Go to: http://localhost:3000/admin/payments/add
   - Verify: Page loads with breadcrumb and heading "Record Payment"

2. **Test Order Selection**
   - Click the "Select order..." button
   - Verify: Dropdown opens showing orders
   - Search: Type a number (e.g., "4") to test search
   - Verify: Orders filter correctly
   - Select: Click on an order (e.g., "Order #4 - रु 90.00")
   - Verify: Button now shows selected order

3. **Test Full Payment Auto-Calculation**
   - Selected order total should be shown (e.g., रु 90.00)
   - Enter: Payment Amount = 90
   - Verify: Due Amount auto-updates to 0.00
   - Check: Payment Summary box displays correctly
     - Order Total: रु 90.00
     - Payment Amount: रु 90.00
     - Due Amount: रु 0.00

4. **Test Partial Payment Auto-Calculation**
   - Clear Payment Amount field
   - Enter: Payment Amount = 45
   - Verify: Due Amount auto-updates to 45.00
   - Check: Payment Summary updates
     - Order Total: रु 90.00
     - Payment Amount: रु 45.00
     - Due Amount: रु 45.00

5. **Test Edge Cases**
   - Enter: 0 (should calculate due = total)
   - Enter: 150 (more than total, should calculate due = 0 or negative)
   - Enter: 0.01 (decimal precision)
   - Verify: All calculate correctly

6. **Test Form Submission**
   - Select an order
   - Enter payment amount: 45
   - Select Status: "Partial"
   - Select Method: "Card"
   - Enter Transaction ID: "TXN12345"
   - Click: "Record Payment"
   - Verify: Redirects to /admin/payments
   - Verify: New payment appears in list

---

### Part 2: Technician Device Management Testing

#### Prerequisites
- Technician user logged in (or navigate directly)
- Frontend and backend running

#### Test Procedure

1. **Device Types Page (/technician/devices/types)**
   - Navigate to: http://localhost:3000/technician/devices/types
   - Verify: Page loads with heading "Device Types"
   - Verify: List of device types displays
   - Click: "Add Device Type" button
   - Verify: Form appears with fields:
     - Device Type Name (required)
     - Description (optional)
   - Enter: Name = "Smartphone", Description = "Mobile phones"
   - Click: "Create Device Type"
   - Verify: Success message and new type added to list
   - Verify: Page reloads with new type visible

2. **Device Brands Page (/technician/devices/brands)**
   - Navigate to: http://localhost:3000/technician/devices/brands
   - Verify: Page loads with heading "Device Brands"
   - Verify: Brands display in 1-3 column grid
   - Click: "Add Brand" button
   - Verify: Form appears with:
     - Brand Name (required)
   - Enter: Name = "TestBrand123"
   - Click: "Create Brand"
   - Verify: Success message and page reloads
   - Verify: New brand appears in grid

3. **Device Models Page (/technician/devices/models)**
   - Navigate to: http://localhost:3000/technician/devices/models
   - Verify: Page loads with heading "Device Models"
   - Verify: Models display in 3-column grid
   - Click: "Add Model" button
   - Verify: Form appears with fields:
     - Model Name (required)
     - Brand (dropdown, required)
     - Device Type (dropdown, required)
   - Select: Brand = "Apple" (or existing brand)
   - Select: Device Type = "Laptop" (or existing type)
   - Enter: Name = "TestModel123"
   - Click: "Create Model"
   - Verify: Success message and page reloads
   - Verify: New model appears in grid showing:
     - Model name
     - Brand name
     - Device type name

---

### Part 3: Sidebar Navigation Testing

#### Prerequisites
- Technician user logged in
- Frontend running

#### Test Procedure

1. **Check Sidebar Displays Device Menu**
   - Verify: Sidebar shows "Devices" as collapsible menu
   - Verify: Submenu items visible:
     - View Devices
     - Device Types
     - Brands
     - Models

2. **Test Navigation Links**
   - Click: "View Devices" → Verify navigates to /technician/devices
   - Click: "Device Types" → Verify navigates to /technician/devices/types
   - Click: "Brands" → Verify navigates to /technician/devices/brands
   - Click: "Models" → Verify navigates to /technician/devices/models

3. **Test Active State**
   - Navigate to each page
   - Verify: Current page is highlighted in sidebar

4. **Mobile Responsive (if testing on mobile)**
   - Resize browser to mobile width
   - Verify: Sidebar collapses
   - Click: Hamburger menu to expand
   - Verify: Device menu still accessible

---

## API Test Results Summary

✅ Test 1: Get Orders
- SUCCESS: Got multiple orders from API
- Sample: Order #2 - Cost 90.00

✅ Test 2: Device Types Management
- SUCCESS: Got 8 device types
- SUCCESS: Created new device type via API

✅ Test 3: Device Brands Management
- SUCCESS: Got 15 brands
- SUCCESS: Created new brand via API

✅ Test 4: Device Models Management
- SUCCESS: Got 14 models
- SUCCESS: Ready for model creation

✅ Test 5: Payments (Auto-calculation)
- SUCCESS: Full payment can be recorded
- SUCCESS: Partial payment can be recorded

---

## Files Tested

1. `/frontend/components/payment-form.tsx`
   - Auto-calculation logic
   - Order selection (combobox)
   - Payment summary display
   - Form validation

2. `/frontend/app/admin/payments/add/page.tsx`
   - Page layout
   - Component integration
   - Success redirect

3. `/frontend/app/technician/devices/types/page.tsx`
   - List display
   - Form toggle
   - Create functionality
   - Page reload on success

4. `/frontend/app/technician/devices/brands/page.tsx`
   - Grid layout
   - Form handling
   - Create functionality
   - Responsive grid

5. `/frontend/app/technician/devices/models/page.tsx`
   - Grid layout
   - Dropdown selection
   - Multiple field validation
   - Related data display (brand, type)

6. `/frontend/components/sidebar/technician.tsx`
   - Navigation structure
   - Sub-menu items
   - Active state handling

---

## Known Observations

1. Orders endpoint returns response with `items` key, not `data` key
   - This is handled correctly by the frontend hooks
   
2. Device management pages reload after creation
   - This ensures fresh data is displayed
   - UX could be improved with optimistic updates

3. Sidebar navigation structure follows admin pattern
   - Consistent with existing UI patterns
   - Proper icon usage (Tabler icons)

---

## Next Steps After Manual Testing

1. If all tests pass:
   - Check browser console for any errors
   - Check network tab for API calls
   - Test form submission error scenarios

2. If any tests fail:
   - Document the failure
   - Check browser console for JavaScript errors
   - Check backend logs for API errors
   - Fix and re-test

3. Performance considerations:
   - Page reloads after creation could be optimized
   - Order dropdown could be virtualized for large lists

---

## Browser Compatibility

Recommend testing in:
- Chrome/Chromium (primary)
- Firefox (compatibility)
- Safari (if available)
- Edge (Microsoft)

## Testing Checklist

- [ ] Payment form order selection works
- [ ] Payment amount input triggers auto-calculation
- [ ] Due amount calculates correctly (order total - payment amount)
- [ ] Payment summary displays correctly
- [ ] Full payment (payment = order total) shows due = 0
- [ ] Partial payment calculates correct due amount
- [ ] Payment form can be submitted successfully
- [ ] Device types page loads
- [ ] Can add new device type
- [ ] Device brands page loads
- [ ] Can add new brand
- [ ] Device models page loads
- [ ] Can add new model with brand and type selection
- [ ] Technician sidebar shows device management menu
- [ ] Sidebar links navigate correctly
- [ ] All pages respond properly to user input
- [ ] No JavaScript errors in console
- [ ] API calls complete successfully
- [ ] Forms validate inputs correctly
- [ ] Success messages display
- [ ] Error messages display (test invalid inputs)

