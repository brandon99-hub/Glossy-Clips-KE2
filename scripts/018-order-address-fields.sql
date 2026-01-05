-- Add detailed address fields to orders table to store location info at point of purchase
ALTER TABLE orders ADD COLUMN IF NOT EXISTS address_type TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS estate_name TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS house_number TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS landmark TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;
