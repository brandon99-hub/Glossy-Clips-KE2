-- Add delivery method and Pickup Mtaani support
ALTER TABLE orders 
ADD COLUMN delivery_method VARCHAR(50) DEFAULT 'pickup', -- 'pickup' or 'pickup_mtaani'
ADD COLUMN delivery_fee DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN pickup_mtaani_location VARCHAR(255);

-- Create Pickup Mtaani locations table
CREATE TABLE pickup_mtaani_locations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  area VARCHAR(255) NOT NULL,
  address TEXT,
  delivery_fee DECIMAL(10, 2) DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create index
CREATE INDEX idx_pickup_locations_active ON pickup_mtaani_locations(is_active);

-- Insert common Pickup Mtaani locations in Nairobi
INSERT INTO pickup_mtaani_locations (name, area, delivery_fee, is_active) VALUES
('Pickup Mtaani - Westlands', 'Westlands', 100, true),
('Pickup Mtaani - CBD', 'CBD', 100, true),
('Pickup Mtaani - Kilimani', 'Kilimani', 100, true),
('Pickup Mtaani - Parklands', 'Parklands', 100, true),
('Pickup Mtaani - South B', 'South B', 150, true),
('Pickup Mtaani - South C', 'South C', 150, true),
('Pickup Mtaani - Eastleigh', 'Eastleigh', 150, true),
('Pickup Mtaani - Kasarani', 'Kasarani', 150, true),
('Pickup Mtaani - Embakasi', 'Embakasi', 150, true),
('Pickup Mtaani - Ngong Road', 'Ngong Road', 100, true),
('Pickup Mtaani - Thika Road', 'Thika Road', 150, true),
('Pickup Mtaani - Mombasa Road', 'Mombasa Road', 150, true);
