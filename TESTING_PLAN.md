# Frontend Testing Plan - Laptop Repair Store Management System

## 📋 Overview

This document outlines the comprehensive testing strategy for the frontend application. The testing pyramid includes unit tests, integration tests, component tests, and end-to-end tests.

---

## 🎯 Testing Strategy

### Testing Pyramid
```
        E2E Tests (Cypress)
       /                  \
      /   Integration     \
     /        Tests        \
    /                      \
   / Component & Unit Tests \
  /                         \
/___________________________\
  (Jest + React Testing Lib)
```

### Coverage Goals
- **Unit Tests**: 80%+ coverage for hooks and utilities
- **Component Tests**: 70%+ coverage for main pages and components
- **Integration Tests**: Key user workflows (auth, CRUD operations)
- **E2E Tests**: Critical user paths (login, create/edit/delete operations)

---

## 📦 Testing Tools Setup

### 1. Jest Configuration
- **Framework**: Jest (Next.js built-in support)
- **Test Environment**: jsdom (for DOM testing)
- **Configuration File**: `jest.config.ts`

### 2. React Testing Library
- **Purpose**: Component and integration testing
- **Key Features**: User-centric testing, accessibility testing
- **Installation**: `npm install --save-dev @testing-library/react @testing-library/jest-dom`

### 3. MSW (Mock Service Worker)
- **Purpose**: Mock API calls for testing
- **Installation**: `npm install --save-dev msw`

### 4. Cypress (Optional for E2E)
- **Purpose**: End-to-end testing
- **Installation**: `npm install --save-dev cypress`

---

## 🧪 Unit Tests (22 Custom Hooks)

### Testing Framework: Jest + React Testing Library

### Hooks to Test

#### Authentication & Core (3 hooks)
1. **useAuth.ts**
   - Test login with valid credentials
   - Test logout functionality
   - Test token refresh
   - Test error handling for invalid credentials
   - Test user data persistence

2. **useApi.ts**
   - Test GET requests
   - Test POST requests with payload
   - Test error handling
   - Test token injection in headers
   - Test request/response interceptors

3. **useUpload.ts**
   - Test file upload
   - Test progress tracking
   - Test error handling for large files
   - Test unsupported file types

#### User Management (3 hooks)
4. **useUsers.ts**
   - Test fetch users list
   - Test pagination
   - Test filtering by search term
   - Test error states

5. **useUserDetail.ts**
   - Test fetch single user
   - Test loading states
   - Test error handling for non-existent users

6. **useUserMutations.ts**
   - Test create user
   - Test update user
   - Test delete user
   - Test validation errors
   - Test success notifications

#### Order Management (3 hooks)
7. **useOrders.ts**
   - Test fetch orders list
   - Test pagination
   - Test status filtering
   - Test error handling

8. **useOrderDetail.ts**
   - Test fetch single order
   - Test loading states
   - Test error handling

9. **useOrderMutations.ts**
   - Test create order
   - Test update order status
   - Test delete order
   - Test cost calculations

#### Device Management (5 hooks)
10. **useDeviceList.ts**
    - Test fetch devices
    - Test pagination
    - Test filtering

11. **useDeviceDetail.ts**
    - Test fetch device details
    - Test loading/error states

12. **useDeviceTypes.ts**
    - Test CRUD operations for device types
    - Test validation

13. **useDeviceBrands.ts**
    - Test CRUD operations for brands
    - Test validation

14. **useDeviceModels.ts**
    - Test CRUD operations for models
    - Test validation

#### Problem Management (1 hook)
15. **useProblems.ts**
    - Test fetch problems
    - Test CRUD operations
    - Test device type filtering

#### Payment Management (3 hooks)
16. **usePayments.ts**
    - Test fetch payments
    - Test status filtering

17. **usePaymentDetail.ts**
    - Test fetch payment details

18. **usePaymentMutations.ts**
    - Test create payment
    - Test update payment
    - Test delete payment

#### Settings & Utilities (4 hooks)
19. **useCostSettings.ts**
    - Test fetch settings
    - Test CRUD operations

20. **useAdminDashboard.ts**
    - Test fetch dashboard stats
    - Test loading/error states

21. **useRoles.ts**
    - Test fetch roles
    - Test role validation

22. **use-mobile.ts**
    - Test mobile device detection
    - Test responsive behavior

---

## 🧩 Component Tests (Key Pages)

### List Pages (12 pages)
1. **Admin Pages**
   - Test TableList rendering
   - Test search functionality
   - Test sorting
   - Test pagination
   - Test CRUD actions (create, view, edit, delete)
   - Test loading states
   - Test empty states
   - Test error handling

### Example Test Suite Structure
```typescript
describe('Admin Users Page', () => {
  it('should render table with user data', () => {})
  it('should allow filtering users', () => {})
  it('should allow sorting by columns', () => {})
  it('should allow pagination', () => {})
  it('should delete user with confirmation', () => {})
  it('should navigate to edit page', () => {})
  it('should show loading state', () => {})
  it('should show empty state', () => {})
})
```

### Form Pages (8 pages)
1. Test form rendering
2. Test form validation
3. Test form submission
4. Test error messages
5. Test success redirects
6. Test loading states

### Detail Pages (6 pages)
1. Test data loading
2. Test data display
3. Test edit/delete actions
4. Test error handling

---

## 🔗 Integration Tests

### Authentication Flow
```
Test Suite: Auth Integration
├── Login with valid credentials
├── Login with invalid credentials
├── Token refresh on expiry
├── Logout and session cleanup
└── Protected route access
```

### CRUD Operations
```
Test Suite: Order CRUD
├── Create order (form submission → API call → redirect)
├── Read order (fetch → display)
├── Update order (fetch → edit → save → validate)
└── Delete order (confirmation → API call → refresh list)
```

### Search & Filter
```
Test Suite: Search & Pagination
├── Search updates results in real-time
├── Pagination changes page
├── Filters apply correctly
└── Combined search + filters work together
```

---

## 🚀 E2E Tests (Cypress)

### Critical User Paths

#### 1. Admin User Management
```
Scenario: Create, Read, Update, Delete User
Given: User is logged in as admin
When: Navigate to users page
Then: See list of users
And: Click "Add User"
And: Fill form with valid data
And: Submit form
Then: Redirected to users list
And: New user appears in list
When: Click edit on new user
And: Change user data
And: Save changes
Then: User data is updated
When: Click delete on user
And: Confirm deletion
Then: User is removed from list
```

#### 2. Customer Order Management
```
Scenario: Submit Service Order
Given: Customer is logged in
When: Navigate to orders
And: Click "Add Order"
And: Select device
And: Select problem
And: Enter cost details
And: Submit form
Then: Order is created
And: Confirmation message appears
When: Navigate back to orders
Then: New order appears in list
```

#### 3. Payment Tracking
```
Scenario: Record and Track Payment
Given: User is logged in as accountant
When: Navigate to payments
And: Click "Add Payment"
And: Fill payment details
And: Submit form
Then: Payment is recorded
When: Search for the payment
Then: Payment appears in results
```

---

## 📊 Test Coverage Requirements

| Category | Target | Tool |
|----------|--------|------|
| Hooks | 80% | Jest |
| Components | 70% | Jest + RTL |
| Pages | 50% | Jest + RTL |
| Integration | 60% | Cypress |
| E2E | Critical paths only | Cypress |

---

## 🛠️ Test Execution

### Local Development
```bash
# Run all tests
npm test

# Run specific test file
npm test -- useAuth.test.ts

# Watch mode
npm test -- --watch

# Coverage report
npm test -- --coverage
```

### CI/CD Pipeline
```bash
# Run tests before build
npm test -- --coverage

# Build after tests pass
npm run build

# Run E2E tests
npm run cypress:run
```

---

## 📝 Test File Structure

```
frontend/
├── __tests__/
│   ├── hooks/
│   │   ├── useAuth.test.ts
│   │   ├── useApi.test.ts
│   │   ├── usePayments.test.ts
│   │   └── ... (22 hooks)
│   ├── components/
│   │   ├── tables/
│   │   │   └── table-list.test.tsx
│   │   └── pages/
│   │       ├── admin-users.test.tsx
│   │       ├── receptionist-orders.test.tsx
│   │       └── ...
│   ├── integration/
│   │   ├── auth-flow.test.ts
│   │   ├── crud-operations.test.ts
│   │   └── search-filter.test.ts
│   └── setup.ts
├── cypress/
│   ├── e2e/
│   │   ├── auth.cy.ts
│   │   ├── admin-users.cy.ts
│   │   ├── orders.cy.ts
│   │   └── ...
│   └── support/
│       ├── commands.ts
│       └── e2e.ts
├── jest.config.ts
└── ...
```

---

## 🎪 Mock Data Strategy

### Mock Service Worker (MSW) Handlers
```typescript
// handlers.ts
export const handlers = [
  rest.get('/api/v1/users', (req, res, ctx) => {
    return res(ctx.json([
      { id: 1, name: 'John', email: 'john@example.com' },
      { id: 2, name: 'Jane', email: 'jane@example.com' },
    ]))
  }),
  
  rest.post('/api/v1/users', (req, res, ctx) => {
    return res(ctx.status(201), ctx.json({ id: 3, ...req.body }))
  }),
]
```

---

## 🔄 Testing Checklist

- [ ] Set up Jest and React Testing Library
- [ ] Configure MSW for API mocking
- [ ] Write unit tests for all 22 hooks
- [ ] Write component tests for all pages
- [ ] Write integration tests for key workflows
- [ ] Set up Cypress for E2E testing
- [ ] Create test coverage reports
- [ ] Configure CI/CD to run tests
- [ ] Document test best practices
- [ ] Set up pre-commit hooks to run tests

---

## ✅ Success Criteria

- ✓ All unit tests passing
- ✓ All component tests passing
- ✓ All integration tests passing
- ✓ All E2E tests passing
- ✓ Code coverage ≥ 70%
- ✓ No console errors or warnings
- ✓ Zero security vulnerabilities
- ✓ Build completes successfully

---

## 📅 Timeline (Estimated)

| Phase | Tasks | Duration |
|-------|-------|----------|
| Setup | Jest, RTL, MSW | 2 hours |
| Unit Tests | 22 hooks | 8 hours |
| Component Tests | All pages | 6 hours |
| Integration Tests | Workflows | 4 hours |
| E2E Tests | Critical paths | 4 hours |
| Optimization | Coverage, performance | 2 hours |

**Total Estimated Time**: ~26 hours

---

## 📚 Resources

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [MSW Documentation](https://mswjs.io/)
- [Cypress Documentation](https://docs.cypress.io/)
- [Next.js Testing](https://nextjs.org/docs/testing)

---

## 🎯 Next Steps

1. Set up Jest and testing libraries
2. Create test infrastructure (mocks, setup files)
3. Begin unit testing hooks
4. Progress to component tests
5. Add integration tests
6. Implement E2E tests
7. Continuous refinement and coverage improvement
