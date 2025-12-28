-- Add missing columns to orders table for analytics
-- Run this in Neon SQL Editor

-- Add has_bundle column to track bundle orders
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS has_bundle BOOLEAN DEFAULT false;

-- Add secret_code column to track secret code usage
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS secret_code VARCHAR(50);

-- Update existing orders to set has_bundle based on items
UPDATE orders 
SET has_bundle = (
  SELECT EXISTS (
    SELECT 1 
    FROM jsonb_array_elements(items) AS item
    WHERE item->>'is_bundle' = 'true'
  )
)
WHERE has_bundle IS NULL;

-- Create index for analytics queries
CREATE INDEX IF NOT EXISTS idx_orders_has_bundle 
ON orders(has_bundle) 
WHERE has_bundle = true;

CREATE INDEX IF NOT EXISTS idx_orders_secret_code 
ON orders(secret_code) 
WHERE secret_code IS NOT NULL;
