# STAFF USER CREDENTIALS
# All passwords are: password123

## 🔑 ADMIN
Email:    admin@repair.com
Phone:    1234567890
Password: password123
User ID:  17
Role:     Admin (Full system access)

## 🔧 TECHNICIAN  
Email:    tech@repair.com
Phone:    1234567891
Password: password123
User ID:  21
Role:     Technician (Handles device repairs)

## 📞 RECEPTION
Email:    reception@repair.com
Phone:    1234567892
Password: password123
User ID:  22
Role:     Reception (Customer service)

## 💰 ACCOUNTANT
Email:    accountant@repair.com
Phone:    1234567893
Password: password123
User ID:  23
Role:     Accountant (Financial transactions)

## 👤 CUSTOMER (Test Account)
Email:    customer@repair.com
Phone:    1234567894
Password: password123
User ID:  24
Role:     Customer (Regular customer account)

## 🧪 TEST USER (Multiple Roles - Will be cleaned)
Email:    test@repair.com
Phone:    9876543210
Password: password123
User ID:  2
Current Roles: Technician, Reception, Customer, Receptionist
After cleanup: Technician only

---

## 📝 NOTES:

1. **User 2 (test@repair.com)** currently has 4 roles assigned. Run the SQL script to clean this up and keep only the Technician role.

2. **Users 3-16, 25-27, 30-31, 38-41, 54** don't have any roles assigned. Run the SQL script to assign them the Customer role.

3. **To assign roles**, run this SQL in your MySQL database:
   ```bash
   mysql -u root -p repair < backend/scripts/assign_roles.sql
   ```

4. **After running the script**, restart your backend server to see the changes reflected in the API responses.

## 🚀 QUICK TEST:

After running the script, test the login endpoint:

```bash
# Test Admin login
curl -X POST http://localhost:8000/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone": "1234567890", "password": "password123"}'

# Test Technician login  
curl -X POST http://localhost:8000/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone": "1234567891", "password": "password123"}'
```

You should now see the `role` field in the response with the user's assigned role!
