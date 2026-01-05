-- Enhance pickup_mtaani_locations table for scraped data
-- This migration adds columns needed to store data from web scraping

-- Add new columns for scraped data
ALTER TABLE pickup_mtaani_locations 
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8),
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS google_maps_url TEXT,
ADD COLUMN IF NOT EXISTS last_scraped_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS data_source VARCHAR(50) DEFAULT 'manual';

-- Create index for geospatial queries (for future distance calculations)
CREATE INDEX IF NOT EXISTS idx_pickup_locations_coords 
ON pickup_mtaani_locations(latitude, longitude);

-- Create index for data source filtering
CREATE INDEX IF NOT EXISTS idx_pickup_locations_source 
ON pickup_mtaani_locations(data_source);

-- Update existing records to mark as manual entries
UPDATE pickup_mtaani_locations 
SET data_source = 'manual' 
WHERE data_source IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN pickup_mtaani_locations.latitude IS 'GPS latitude coordinate from Google Maps';
COMMENT ON COLUMN pickup_mtaani_locations.longitude IS 'GPS longitude coordinate from Google Maps';
COMMENT ON COLUMN pickup_mtaani_locations.description IS 'Detailed location description with landmarks';
COMMENT ON COLUMN pickup_mtaani_locations.google_maps_url IS 'Direct link to Google Maps location';
COMMENT ON COLUMN pickup_mtaani_locations.last_scraped_at IS 'Timestamp of last successful scrape';
COMMENT ON COLUMN pickup_mtaani_locations.data_source IS 'Source of data: manual, scraped, or api';
