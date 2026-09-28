-- Add is_approved column to testimonials table
ALTER TABLE testimonials 
ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT false;

-- Set existing testimonials to approved (so they don't disappear)
UPDATE testimonials 
SET is_approved = true 
WHERE is_approved IS NULL;

-- Add comment for clarity
COMMENT ON COLUMN testimonials.is_approved IS 'Whether the testimonial has been approved by admin for public display';
