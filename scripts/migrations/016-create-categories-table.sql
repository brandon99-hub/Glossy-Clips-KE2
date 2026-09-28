-- Create categories table for dynamic category management
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Seed with existing and new categories
INSERT INTO categories (name, slug, display_order, is_active) VALUES
  ('Hair Clips', 'hair-clip', 1, true),
  ('Lip Gloss', 'gloss', 2, true),
  ('Hair Charms', 'hair-charm', 3, true),
  ('Headbands', 'headband', 4, true),
  ('Scrunchies', 'scrunchie', 5, true);

-- Create indexes for performance
CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_active ON categories(is_active);
CREATE INDEX idx_categories_order ON categories(display_order);

-- Add comment
COMMENT ON TABLE categories IS 'Product categories managed by admin';
