-- Truncate orders, secret codes, and users (keeping only admin)
-- WARNING: This will delete ALL order and QR code data!
-- Run this script carefully in your database

-- Step 1: Delete all orders (this will cascade to related data)
TRUNCATE TABLE orders CASCADE;

-- Step 2: Delete all secret codes
TRUNCATE TABLE secret_codes CASCADE;

-- Step 3: Delete all gift cards
TRUNCATE TABLE gift_cards CASCADE;

-- Step 4: Delete all customers except admin
-- First, let's see what we have
SELECT id, username FROM admin_users;

-- Delete all regular users (customers table)
TRUNCATE TABLE customers CASCADE;

-- Optional: If you want to keep only the admin user in admin_users table
-- DELETE FROM admin_users WHERE username != 'admin';

-- Verify the cleanup
SELECT 'Orders remaining:' as info, COUNT(*) as count FROM orders
UNION ALL
SELECT 'Secret codes remaining:', COUNT(*) FROM secret_codes
UNION ALL
SELECT 'Gift cards remaining:', COUNT(*) FROM gift_cards
UNION ALL
SELECT 'Customers remaining:', COUNT(*) FROM customers
UNION ALL
SELECT 'Admin users remaining:', COUNT(*) FROM admin_users;
