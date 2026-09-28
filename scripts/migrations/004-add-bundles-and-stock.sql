-- Add stock_quantity to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS stock_quantity INTEGER DEFAULT 50;

-- Create bundles table for admin-managed bundle deals
CREATE TABLE IF NOT EXISTS bundles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  product_ids INTEGER[] NOT NULL, -- Array of product IDs in the bundle
  original_price DECIMAL(10, 2) NOT NULL,
  bundle_price DECIMAL(10, 2) NOT NULL,
  savings DECIMAL(10, 2) NOT NULL,
  image VARCHAR(500),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create index for active bundles
CREATE INDEX idx_bundles_active ON bundles(is_active);
