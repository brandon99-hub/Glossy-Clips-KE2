-- Add product reviews table
CREATE TABLE product_reviews (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  customer_name VARCHAR(255) NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  is_verified_purchase BOOLEAN DEFAULT FALSE,
  is_approved BOOLEAN DEFAULT FALSE,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_reviews_product ON product_reviews(product_id);
CREATE INDEX idx_reviews_approved ON product_reviews(is_approved);
CREATE INDEX idx_reviews_rating ON product_reviews(rating);

-- Add average rating to products (denormalized for performance)
ALTER TABLE products 
ADD COLUMN average_rating DECIMAL(2, 1) DEFAULT 0,
ADD COLUMN review_count INTEGER DEFAULT 0;

-- Function to update product rating when review is approved
CREATE OR REPLACE FUNCTION update_product_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE products
  SET 
    average_rating = (
      SELECT COALESCE(AVG(rating), 0)
      FROM product_reviews
      WHERE product_id = NEW.product_id AND is_approved = true
    ),
    review_count = (
      SELECT COUNT(*)
      FROM product_reviews
      WHERE product_id = NEW.product_id AND is_approved = true
    )
  WHERE id = NEW.product_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update ratings
CREATE TRIGGER update_rating_on_review
AFTER INSERT OR UPDATE OF is_approved ON product_reviews
FOR EACH ROW
WHEN (NEW.is_approved = true)
EXECUTE FUNCTION update_product_rating();
