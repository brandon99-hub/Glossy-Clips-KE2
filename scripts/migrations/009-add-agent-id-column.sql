-- Add agent_id column for Pickup Mtaani API integration
ALTER TABLE pickup_mtaani_locations 
ADD COLUMN IF NOT EXISTS agent_id INTEGER,
ADD COLUMN IF NOT EXISTS zone VARCHAR(255),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- Add unique constraint on agent_id if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'pickup_mtaani_locations_agent_id_key'
    ) THEN
        ALTER TABLE pickup_mtaani_locations ADD CONSTRAINT pickup_mtaani_locations_agent_id_key UNIQUE (agent_id);
    END IF;
END $$;

-- Create index on agent_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_pickup_locations_agent_id ON pickup_mtaani_locations(agent_id);

