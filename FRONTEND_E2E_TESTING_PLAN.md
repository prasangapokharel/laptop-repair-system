# Frontend & End-to-End Testing Plan
**Created**: January 2, 2026  
**Status**: Ready for Execution

---

## 🎯 Testing Strategy

This document outlines the comprehensive testing plan for the Laptop Repair Store Management System frontend and end-to-end workflows.

---

## Phase 1: Authentication & Login Testing

### 1.1 Login Page Load
**Objective**: Verify login page renders correctly and can accept input

**Test Steps**:
1. Navigate to http://localhost:3000/auth/login
2. Verify page title: "Sign In | Laptop Repair Management"
3. Verify form fields present:
   - Phone Number input
   - Password input
   - Sign In button
   - Alternative auth options
4. Verify responsive design (desktop and mobile)

**Expected Result**: ✅ Page loads, all UI elements visible

**Test Data**:
```
Phone: 1234567890
Password: admin123
```

### 1.2 Successful Login
**Objective**: User can login and receives valid JWT token

**Test Steps**:
1. Enter phone: `1234567890`
2. Enter password: `admin123`
3. Click "Sign In" button
4. Wait for redirect (should go to dashboard)
5. Verify token is stored in localStorage/sessionStorage

**Expected Result**: ✅ Redirected to dashboard, token stored

**Verification**:
```javascript
// In browser console
localStorage.getItem('access_token')
// Should return a JWT token starting with "eyJ..."
```

### 1.3 Failed Login
**Objective**: Invalid credentials show error message

**Test Steps**:
1. Enter phone: `1234567890`
2. Enter password: `wrongpassword`
3. Click "Sign In"
4. Verify error message appears

**Expected Result**: ✅ Error message displayed, page not redirected

### 1.4 Logout
**Objective**: User can logout and token is cleared

**Test Steps**:
1. Login successfully
2. Click user menu (top right)
3. Click "Logout"
4. Verify redirected to login page
5. Verify token is removed from storage

**Expected Result**: ✅ Logged out, token cleared

---

## Phase 2: Admin Module Testing

### 2.1 Admin Dashboard
**Objective**: Dashboard displays data and summary statistics

**Test Steps**:
1. Login as admin
2. Navigate to `/admin/dashboard`
3. Verify page loads
4. Check for key metrics:
   - Total users count
   - Total orders count
   - Pending orders
   - Recent activity

**Expected Result**: ✅ Dashboard loads with correct data

### 2.2 Users CRUD Operations
**Objective**: Verify all user management operations work

#### Create User
**Test Steps**:
1. Navigate to `/admin/users`
2. Click "Add User" button
3. Fill in form:
   - Full Name: Test User
   - Phone: 9999999999
   - Email: test@example.com
   - Password: Test@123456
   - Role: Customer
4. Submit form
5. Verify user appears in list

**Expected Result**: ✅ User created and visible in list

#### Read/List Users
**Test Steps**:
1. Navigate to `/admin/users`
2. Verify table loads with users
3. Test search: Search for "Admin"
4. Test sorting: Click column headers
5. Test pagination: Navigate between pages

**Expected Result**: ✅ List works, search/sort/pagination functional

#### Update User
**Test Steps**:
1. In users list, click edit icon on any user
2. Change a field (e.g., email)
3. Click save/update
4. Verify change reflected in list

**Expected Result**: ✅ User updated successfully

#### Delete User
**Test Steps**:
1. In users list, click delete icon
2. Confirm deletion in dialog
3. Verify user removed from list

**Expected Result**: ✅ User deleted, confirmation required

### 2.3 Orders CRUD Operations
**Objective**: Verify order management

#### Create Order
**Test Steps**:
1. Navigate to `/admin/orders`
2. Click "Add Order"
3. Select Device
4. Select Problem
5. Enter Cost, Discount
6. Click Save

**Expected Result**: ✅ Order created with proper calculations

#### Update Order Status
**Test Steps**:
1. Open order detail
2. Change status from Pending to In Progress
3. Save
4. Verify status updated in list

**Expected Result**: ✅ Status updated

### 2.4 Device Management
**Objective**: Verify device types, brands, models management

#### Device Types
1. Navigate to `/admin/devices/types`
2. Test CRUD operations
3. Verify list displays correctly

#### Brands
1. Navigate to `/admin/devices/brands`
2. Create new brand
3. Verify in list

#### Models
1. Navigate to `/admin/devices/models`
2. Create new model
3. Select brand and type
4. Verify created

**Expected Result**: ✅ All device management features work

### 2.5 Assignments (Technician Assignment)
**Objective**: Verify technicians can be assigned to orders

**Test Steps**:
1. Navigate to `/admin/assignments`
2. Click "Add Assignment"
3. Select Order (e.g., Order #2)
4. Select Technician (user with technician role)
5. Add note (optional)
6. Submit
7. Verify assignment appears in list

**Expected Result**: ✅ Assignment created, links technician to order

---

## Phase 3: Receptionist Module Testing

### 3.1 Receptionist Dashboard
**Objective**: Verify receptionist can see appropriate data

**Test Steps**:
1. Login as receptionist user (if exists, or create one)
2. Navigate to `/receptionist/dashboard`
3. Verify shows:
   - Recent orders
   - Pending items
   - Customers

**Expected Result**: ✅ Dashboard displays receptionist-specific data

### 3.2 Order Management (Receptionist)
**Test Steps**:
1. Navigate to `/receptionist/orders`
2. Create new order
3. Search for customers
4. Verify can see all orders but maybe not all functions

**Expected Result**: ✅ Order list and management works for receptionist

---

## Phase 4: Technician Module Testing

### 4.1 Technician Dashboard
**Objective**: Technician sees assigned orders

**Test Steps**:
1. Login as technician
2. Navigate to `/technician/dashboard`
3. Verify shows:
   - My assignments count
   - Pending work

**Expected Result**: ✅ Dashboard shows assigned orders

### 4.2 Assigned Orders
**Test Steps**:
1. Navigate to `/technician/orders`
2. Verify shows only technician's assigned orders
3. Click on order
4. Verify can see order details
5. Try to update order status
6. Verify can only see allowed fields

**Expected Result**: ✅ Technician sees only their assignments

---

## Phase 5: Accountant Module Testing

### 5.1 Payments Management
**Objective**: Verify accountant can manage payments

**Test Steps**:
1. Login as accountant
2. Navigate to `/accountant/payments`
3. Verify can see all payments
4. Create new payment
5. Update payment status
6. Verify calculation correct

**Expected Result**: ✅ Payment management works

---

## Phase 6: Customer Module Testing

### 6.1 Customer Dashboard
**Objective**: Customer sees their orders

**Test Steps**:
1. Login as customer
2. Navigate to `/customer/dashboard`
3. Verify shows only their orders

**Expected Result**: ✅ Customer sees personal data only

### 6.2 My Orders
**Test Steps**:
1. Navigate to `/customer/orders`
2. Verify shows only customer's orders
3. Click to view order details

**Expected Result**: ✅ Customer order view works

---

## Phase 7: Role-Based Access Control Testing

### 7.1 Access Control Verification
**Objective**: Verify users can only access allowed routes

**Test Steps**:
1. Login as customer user
2. Try to navigate to `/admin/users`
3. Verify access denied or redirect to dashboard
4. Login as admin
5. Navigate to `/admin/users`
6. Verify access granted

**Expected Result**: ✅ RBAC enforced on frontend

**Test Matrix**:
| Route | Admin | Receptionist | Technician | Accountant | Customer |
|-------|:-----:|:------------:|:----------:|:----------:|:--------:|
| /admin/* | ✅ | ❌ | ❌ | ❌ | ❌ |
| /receptionist/* | ❌ | ✅ | ❌ | ❌ | ❌ |
| /technician/* | ❌ | ❌ | ✅ | ❌ | ❌ |
| /accountant/* | ❌ | ❌ | ❌ | ✅ | ❌ |
| /customer/* | ❌ | ❌ | ❌ | ❌ | ✅ |

---

## Phase 8: Data Flow & Integration Testing

### 8.1 Create-Read-Update-Delete Flow
**Objective**: Complete CRUD cycle for each entity

**Test Steps for Each Entity** (Orders, Devices, Users, etc.):
1. **Create**: Create new record with valid data
2. **Read**: Verify appears in list immediately
3. **Update**: Edit record, verify change reflected
4. **Delete**: Delete record, verify removed from list

**Expected Result**: ✅ All CRUD operations work, data persists

### 8.2 Data Consistency
**Objective**: Verify data consistency across views

**Test Steps**:
1. Create an order with specific values
2. View in list
3. Click to detail
4. Verify all fields match
5. Update a field
6. Go back to list
7. Verify change appears in list

**Expected Result**: ✅ Data consistent across views

### 8.3 Real-time Updates
**Objective**: Verify page shows latest data when refreshed

**Test Steps**:
1. Open orders list in one tab
2. In another tab, create new order
3. Refresh first tab
4. Verify new order appears

**Expected Result**: ✅ Data updates on refresh

---

## Phase 9: Form Validation Testing

### 9.1 Required Fields
**Test Steps**:
1. Navigate to any create/edit form
2. Leave required fields empty
3. Try to submit
4. Verify error message shows

**Expected Result**: ✅ Required field validation works

### 9.2 Email Validation
**Test Steps**:
1. In user form, enter invalid email: "notanemail"
2. Try to submit
3. Verify email validation error

**Expected Result**: ✅ Email validation works

### 9.3 Phone Number Validation
**Test Steps**:
1. Enter invalid phone
2. Try to submit
3. Verify error

**Expected Result**: ✅ Phone validation works

### 9.4 Number Range Validation
**Test Steps**:
1. In order cost field, try to enter negative number
2. Verify error or rejection

**Expected Result**: ✅ Number validation works

---

## Phase 10: Error Handling & Edge Cases

### 10.1 Network Error Handling
**Test Steps**:
1. Stop backend server
2. Try to perform API call (login, fetch data)
3. Verify error message shown (not crash)
4. Restart backend
5. Verify works again

**Expected Result**: ✅ Graceful error handling

### 10.2 Invalid Token Handling
**Test Steps**:
1. Manually edit token in storage (corrupt it)
2. Try to access protected page
3. Verify redirected to login

**Expected Result**: ✅ Invalid token handled

### 10.3 Empty Results
**Test Steps**:
1. Search for non-existent item
2. Verify "no results" message shown
3. Verify no crashes

**Expected Result**: ✅ Empty state handled

### 10.4 Large Data Sets
**Test Steps**:
1. Create 100+ records (can do via API)
2. Navigate to list
3. Verify pagination works
4. Verify search works
5. Verify no slowdown

**Expected Result**: ✅ Performance acceptable

---

## Phase 11: UI/UX Testing

### 11.1 Responsive Design
**Test Steps**:
1. View pages on desktop (1920x1080)
2. View pages on tablet (768x1024)
3. View pages on mobile (375x667)
4. Verify layouts adjust correctly
5. Verify tables become scrollable
6. Verify sidebars collapse

**Expected Result**: ✅ All breakpoints work

### 11.2 Dark Mode (if applicable)
**Test Steps**:
1. Toggle dark mode
2. Verify all pages render correctly
3. Verify text is readable
4. Verify no broken styles

**Expected Result**: ✅ Dark mode works

### 11.3 Loading States
**Test Steps**:
1. Perform slow action (create user with slow network)
2. Verify loading spinner/state shown
3. Verify button is disabled during load
4. Verify completes when done

**Expected Result**: ✅ Loading states work

---

## Testing Checklist

### Pre-Testing Setup
- [ ] Backend running on http://localhost:8000
- [ ] Frontend running on http://localhost:3000
- [ ] Database populated with seed data
- [ ] Test users created in all roles
- [ ] Browser dev tools open for debugging

### Admin Module
- [ ] Users CRUD works
- [ ] Orders CRUD works
- [ ] Devices CRUD works
- [ ] Assignments work
- [ ] Dashboard shows data

### Role-Based Access
- [ ] Admin access verified
- [ ] Receptionist access verified
- [ ] Technician access verified
- [ ] Accountant access verified
- [ ] Customer access verified
- [ ] Access denied for unauthorized users

### Data Integrity
- [ ] Create/read/update/delete all work
- [ ] Data persists across sessions
- [ ] Relationships maintained (foreign keys)
- [ ] Calculations correct (costs, totals)
- [ ] Timestamps recorded correctly

### Error Handling
- [ ] Invalid input rejected
- [ ] API errors shown gracefully
- [ ] Network errors handled
- [ ] Form validation works
- [ ] Empty states displayed

### Performance
- [ ] Pages load in < 2 seconds
- [ ] Tables with 100+ items still responsive
- [ ] Search returns results quickly
- [ ] No memory leaks
- [ ] No console errors

---

## Test Environments

### Development
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:8000
- **Database**: localhost:3306 (repair)

### Test Data
- **Test Admin**: phone=1234567890, password=admin123

---

## Defect Logging

### Format for Issues Found
```
Defect ID: <number>
Title: <brief description>
Severity: Critical/High/Medium/Low
Steps to Reproduce: <detailed steps>
Expected: <what should happen>
Actual: <what actually happens>
Screenshots: <if applicable>
Environment: <desktop/tablet/mobile, browser, etc>
```

---

## Sign-Off

**Testing Status**: ⏳ PENDING EXECUTION

Once all tests pass, fill in:
- [ ] All tests passed
- [ ] No critical issues
- [ ] No high-priority issues
- [ ] Ready for production

**Tested By**: _________________  
**Date**: _________________  
**Sign-Off**: _________________

---

## Next Steps After Testing

1. **If All Tests Pass**:
   - Run production build
   - Deploy to staging
   - Run smoke tests on staging
   - Deploy to production

2. **If Issues Found**:
   - Log defects
   - Prioritize by severity
   - Fix issues
   - Re-test fixed features
   - Repeat until all pass

3. **Performance Optimization**:
   - Profile slow pages
   - Optimize images
   - Cache frequently accessed data
   - Consider code splitting

4. **Security Review**:
   - Check for XSS vulnerabilities
   - Verify CSRF protection
   - Test password security
   - Review API permissions
   - Penetration testing if needed

---

**Document Version**: 1.0  
**Last Updated**: January 2, 2026  
**Status**: Ready for Testing
