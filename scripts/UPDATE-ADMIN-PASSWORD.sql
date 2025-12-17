-- Update admin password to Temppassword-123
-- Hash generated with bcrypt
UPDATE admin_users 
SET password_hash = '$2b$10$Eo.4geb0J0/rCQrSoVtxO7zmMaybUa5G'
WHERE username = 'admin';

-- Add email column if it doesn't exist
ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS email VARCHAR(255) UNIQUE;
