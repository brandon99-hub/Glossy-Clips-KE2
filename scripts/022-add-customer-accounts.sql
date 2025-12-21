-- Customer Account System Database Migration
-- Creates all necessary tables for customer accounts

-- 1. Customers table
CREATE TABLE IF NOT EXISTS customers (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  phone_number VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);

-- 2. Customer addresses table
CREATE TABLE IF NOT EXISTS customer_addresses (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER REFERENCES customers(id) ON DELETE CASCADE,
  address_type VARCHAR(50) DEFAULT 'delivery',
  location TEXT NOT NULL,
  phone_number VARCHAR(20),
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_addresses_customer ON customer_addresses(customer_id);

-- 3. Customer reviews table (auto-approved for verified purchases)
CREATE TABLE IF NOT EXISTS customer_reviews (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  customer_id INTEGER REFERENCES customers(id) ON DELETE CASCADE,
  order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  review_images TEXT[],
  is_verified BOOLEAN DEFAULT true,
  is_approved BOOLEAN DEFAULT true, -- Auto-approved for customer reviews
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(product_id, customer_id, order_id)
);

CREATE INDEX IF NOT EXISTS idx_reviews_product ON customer_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_customer ON customer_reviews(customer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_approved ON customer_reviews(is_approved);

-- 4. Product waitlists table
CREATE TABLE IF NOT EXISTS product_waitlists (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  customer_id INTEGER REFERENCES customers(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  notified BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(product_id, customer_id)
);

CREATE INDEX IF NOT EXISTS idx_waitlist_product ON product_waitlists(product_id);
CREATE INDEX IF NOT EXISTS idx_waitlist_customer ON product_waitlists(customer_id);

-- 5. Abandoned carts table
CREATE TABLE IF NOT EXISTS abandoned_carts (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER REFERENCES customers(id) ON DELETE CASCADE,
  session_id VARCHAR(255),
  cart_items JSONB NOT NULL,
  total_amount DECIMAL(10, 2),
  email_sent BOOLEAN DEFAULT false,
  recovered BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_abandoned_customer ON abandoned_carts(customer_id);
CREATE INDEX IF NOT EXISTS idx_abandoned_session ON abandoned_carts(session_id);

-- 6. Update orders table to link with customers
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS customer_id INTEGER REFERENCES customers(id),
ADD COLUMN IF NOT EXISTS estimated_delivery TIMESTAMP;

CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);

-- 7. Wishlists table already has customer_id from previous migration
-- Just ensure index exists
CREATE INDEX IF NOT EXISTS idx_wishlist_customer ON wishlists(customer_id);

-- 8. Add review count to products for sorting
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS average_rating DECIMAL(3, 2) DEFAULT 0;

-- Function to update product review stats
CREATE OR REPLACE FUNCTION update_product_review_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE products
    SET 
      review_count = (
        SELECT COUNT(*) 
        FROM customer_reviews 
        WHERE product_id = NEW.product_id AND is_approved = true
      ),
      average_rating = (
        SELECT COALESCE(AVG(rating), 0) 
        FROM customer_reviews 
        WHERE product_id = NEW.product_id AND is_approved = true
      )
    WHERE id = NEW.product_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE products
    SET 
      review_count = (
        SELECT COUNT(*) 
        FROM customer_reviews 
        WHERE product_id = OLD.product_id AND is_approved = true
      ),
      average_rating = (
        SELECT COALESCE(AVG(rating), 0) 
        FROM customer_reviews 
        WHERE product_id = OLD.product_id AND is_approved = true
      )
    WHERE id = OLD.product_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update review stats
DROP TRIGGER IF EXISTS update_review_stats_trigger ON customer_reviews;
CREATE TRIGGER update_review_stats_trigger
AFTER INSERT OR UPDATE OR DELETE ON customer_reviews
FOR EACH ROW
EXECUTE FUNCTION update_product_review_stats();
