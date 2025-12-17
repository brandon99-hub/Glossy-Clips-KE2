-- Add wishlist table for guest and future logged-in users
CREATE TABLE wishlists (
  id SERIAL PRIMARY KEY,
  session_id VARCHAR(255), -- For guest users
  customer_id INTEGER, -- For logged-in users (future feature)
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(session_id, product_id)
);

-- Create indexes
CREATE INDEX idx_wishlist_session ON wishlists(session_id);
CREATE INDEX idx_wishlist_customer ON wishlists(customer_id);
CREATE INDEX idx_wishlist_product ON wishlists(product_id);

-- Add wishlist count to products (for analytics)
ALTER TABLE products 
ADD COLUMN wishlist_count INTEGER DEFAULT 0;

-- Function to update wishlist count
CREATE OR REPLACE FUNCTION update_wishlist_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE products
    SET wishlist_count = wishlist_count + 1
    WHERE id = NEW.product_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE products
    SET wishlist_count = wishlist_count - 1
    WHERE id = OLD.product_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update wishlist count
CREATE TRIGGER update_wishlist_count_trigger
AFTER INSERT OR DELETE ON wishlists
FOR EACH ROW
EXECUTE FUNCTION update_wishlist_count();
