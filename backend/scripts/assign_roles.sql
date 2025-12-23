-- Script to assign Customer role to all users without roles
-- Run this SQL script in your MySQL database

-- First, let's see which users don't have roles
SELECT u.id, u.full_name, u.email, u.phone
FROM users u
LEFT JOIN role_enroll re ON u.id = re.user_id
WHERE re.id IS NULL;

-- Assign Customer role (role_id = 5) to all users without roles
INSERT INTO role_enroll (user_id, role_id, created_at)
SELECT u.id, 5, NOW()
FROM users u
LEFT JOIN role_enroll re ON u.id = re.user_id
WHERE re.id IS NULL;

-- Clean up duplicate roles for user 2 (test@repair.com)
-- Keep only Technician role (role_id = 2), remove others
DELETE FROM role_enroll 
WHERE user_id = 2 AND role_id IN (3, 5, 29);

-- Verify the changes
SELECT u.id, u.full_name, u.email, r.name as role_name
FROM users u
JOIN role_enroll re ON u.id = re.user_id
JOIN roles r ON re.role_id = r.id
ORDER BY u.id, r.id;
