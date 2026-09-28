-- Add tracking columns to secret_codes table
ALTER TABLE secret_codes 
ADD COLUMN IF NOT EXISTS is_scanned BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS scanned_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS used_at TIMESTAMP;

-- Add comment for clarity
COMMENT ON COLUMN secret_codes.is_exported IS 'Set to true when PDF is exported';
COMMENT ON COLUMN secret_codes.is_scanned IS 'Set to true when QR code is scanned (one-time only)';
COMMENT ON COLUMN secret_codes.is_used IS 'Set to true when order is placed';
COMMENT ON COLUMN secret_codes.scanned_at IS 'Timestamp when QR was first scanned';
COMMENT ON COLUMN secret_codes.used_at IS 'Timestamp when order was placed';
