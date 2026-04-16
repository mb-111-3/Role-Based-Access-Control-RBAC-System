-- ============================================================
-- RBAC System — Manual Password Reset Script
-- Run this in MySQL if login is still broken after restart
-- Usage: mysql -u root -p rbac < reset_passwords.sql
-- ============================================================

USE rbac;

-- Show current users
SELECT id, username, email, role, LENGTH(password) as pwd_len, created_at FROM users;

-- Delete ALL existing seed users so SeedDB() recreates them fresh
-- (SeedDB will re-hash passwords correctly on next server start)
DELETE FROM users WHERE username IN ('admin', 'editor', 'viewer');

-- Confirm deletion
SELECT 'Seed users deleted. Restart the Go server to re-seed with correct passwords.' AS status;

-- ============================================================
-- After running this script, restart the server:
--   go run main.go
-- It will recreate admin/editor/viewer with fresh bcrypt hashes
-- ============================================================