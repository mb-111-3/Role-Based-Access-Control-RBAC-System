-- ============================================================
-- RBAC System — Inspect Users in MySQL
-- Usage: mysql -u root -p rbac < check_users.sql
-- ============================================================

USE rbac;

-- View all users (password column shows length, not the actual hash)
SELECT 
    id,
    username,
    email,
    role,
    LENGTH(password)  AS password_length,
    CASE 
        WHEN password LIKE '$2a$%' THEN 'bcrypt ✓'
        WHEN password LIKE '$2b$%' THEN 'bcrypt ✓'
        ELSE 'NOT bcrypt ✗'
    END AS password_type,
    created_at,
    deleted_at
FROM users
ORDER BY id;