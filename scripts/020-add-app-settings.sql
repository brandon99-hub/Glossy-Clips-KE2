-- Add app_settings table for global configuration
CREATE TABLE IF NOT EXISTS app_settings (
  id SERIAL PRIMARY KEY,
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value TEXT NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert default secret discount percentage
INSERT INTO app_settings (setting_key, setting_value) 
VALUES ('secret_discount_percent', '10')
ON CONFLICT (setting_key) DO NOTHING;

-- Add comment for clarity
COMMENT ON TABLE app_settings IS 'Global application settings and configuration';
COMMENT ON COLUMN app_settings.setting_key IS 'Unique identifier for the setting';
COMMENT ON COLUMN app_settings.setting_value IS 'Value stored as text, parse as needed';
