-- Performance indexes for common queries
-- Run this migration to optimize database performance

-- Composite indexes for filtering
CREATE INDEX IF NOT EXISTS idx_products_category_active 
ON products(category, is_active) 
WHERE is_secret = false;

CREATE INDEX IF NOT EXISTS idx_products_price 
ON products(price) 
WHERE is_active = true AND is_secret = false;

CREATE INDEX IF NOT EXISTS idx_orders_status_created 
ON orders(status, created_at DESC);

-- Partial indexes for active products
CREATE INDEX IF NOT EXISTS idx_active_products 
ON products(created_at DESC) 
WHERE is_active = true AND is_secret = false;

CREATE INDEX IF NOT EXISTS idx_active_bundles 
ON bundles(created_at DESC) 
WHERE is_active = true;

-- Index for wishlist queries
CREATE INDEX IF NOT EXISTS idx_wishlists_product 
ON wishlists(product_id, created_at DESC);

-- Index for customer orders
CREATE INDEX IF NOT EXISTS idx_orders_customer 
ON orders(customer_id, created_at DESC) 
WHERE customer_id IS NOT NULL;

-- Analyze tables for query planner
ANALYZE products;
ANALYZE orders;
ANALYZE bundles;
ANALYZE wishlists;
