-- Add type column to categorise addresses for specific delivery methods
ALTER TABLE customer_addresses 
ADD COLUMN IF NOT EXISTS address_type VARCHAR(50) DEFAULT 'door_to_door';

-- Update existing addresses to be 'door_to_door' by default if they look like home addresses
-- or leave as default.
UPDATE customer_addresses SET address_type = 'door_to_door' WHERE address_type IS NULL;

-- Verification query to check schema
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'customer_addresses';
