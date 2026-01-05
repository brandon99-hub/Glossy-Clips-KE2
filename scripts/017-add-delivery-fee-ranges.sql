-- Migration to add missing delivery fee range columns
BEGIN;

-- 1. Add the columns if they don't exist
ALTER TABLE pickup_mtaani_locations 
ADD COLUMN IF NOT EXISTS delivery_fee_min DECIMAL(10,2) DEFAULT 180.00,
ADD COLUMN IF NOT EXISTS delivery_fee_max DECIMAL(10,2) DEFAULT 250.00;

COMMIT;
