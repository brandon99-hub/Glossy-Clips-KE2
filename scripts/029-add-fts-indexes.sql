-- Migration: Add Full-Text Search Support
-- Goal: Improve search performance and relevance for product searches.

-- 1. Add GIN index for product name (highest weight 'A')
CREATE INDEX IF NOT EXISTS idx_products_name_fts ON products USING GIN (to_tsvector('english', name));

-- 2. Add GIN index for product description (lower weight 'B')
CREATE INDEX IF NOT EXISTS idx_products_description_fts ON products USING GIN (to_tsvector('english', description));

-- 3. (Optional) Add a combined index if we frequently search both
CREATE INDEX IF NOT EXISTS idx_products_search_combined_fts ON products USING GIN (
  (setweight(to_tsvector('english', name), 'A') || 
   setweight(to_tsvector('english', COALESCE(description, '')), 'B'))
);
