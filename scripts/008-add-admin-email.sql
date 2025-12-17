-- Add email column to admin_users table
ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS email VARCHAR(255) UNIQUE;

-- Update existing admin user with email (change this to your actual email)
UPDATE admin_users SET email = 'admin@glossyclipske.com' WHERE username = 'admin';
