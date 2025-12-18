-- Add image field to categories table
ALTER TABLE categories 
ADD COLUMN image VARCHAR(500);

-- Add comment
COMMENT ON COLUMN categories.image IS 'Category card image URL for homepage display';
