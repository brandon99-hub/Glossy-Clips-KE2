-- Update products table to reference categories table
-- First, update existing product categories to use slugs
UPDATE products SET category = 'hair-clip' WHERE category = 'Hair Clip';
UPDATE products SET category = 'gloss' WHERE category = 'Gloss';
UPDATE products SET category = 'hair-charm' WHERE category = 'Hair Charm';
UPDATE products SET category = 'headband' WHERE category = 'Headband';
UPDATE products SET category = 'scrunchie' WHERE category = 'Scrunchie';

-- Add foreign key constraint
ALTER TABLE products 
  ADD CONSTRAINT products_category_fkey 
  FOREIGN KEY (category) 
  REFERENCES categories(slug) 
  ON DELETE RESTRICT
  ON UPDATE CASCADE;

-- Update comment
COMMENT ON COLUMN products.category IS 'References categories.slug';
