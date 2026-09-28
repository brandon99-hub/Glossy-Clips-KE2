-- Migration to add rich address fields to customer_addresses
ALTER TABLE customer_addresses 
ADD COLUMN IF NOT EXISTS address_type VARCHAR(50) DEFAULT 'door_to_door',
ADD COLUMN IF NOT EXISTS location_name TEXT, -- The formatted name from geocoding
ADD COLUMN IF NOT EXISTS estate_name TEXT,
ADD COLUMN IF NOT EXISTS house_number TEXT,
ADD COLUMN IF NOT EXISTS landmark TEXT,
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8),
ADD COLUMN IF NOT EXISTS pickup_mtaani_id INTEGER REFERENCES pickup_mtaani_locations(id);

-- Update existing records to have a default type if missing
UPDATE customer_addresses SET address_type = 'door_to_door' WHERE address_type IS NULL;
