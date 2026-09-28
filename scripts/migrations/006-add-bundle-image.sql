-- Add bundle_image column to bundles table
ALTER TABLE bundles ADD COLUMN IF NOT EXISTS bundle_image TEXT;
