-- Add customer_id to testimonials table for verified customer testimonials
-- Run this migration if you haven't already

ALTER TABLE testimonials 
ADD COLUMN IF NOT EXISTS customer_id INTEGER REFERENCES customers(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_testimonials_customer ON testimonials(customer_id);

-- Optional: Clean up old testimonials that aren't from verified customers
-- Uncomment if you want to remove non-customer testimonials:
-- DELETE FROM testimonials WHERE customer_id IS NULL;
