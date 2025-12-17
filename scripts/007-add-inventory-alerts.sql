-- Add inventory management fields
ALTER TABLE products 
ADD COLUMN low_stock_threshold INTEGER DEFAULT 5,
ADD COLUMN notify_on_low_stock BOOLEAN DEFAULT TRUE;

-- Create inventory alerts table
CREATE TABLE inventory_alerts (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  alert_type VARCHAR(50) NOT NULL, -- 'low_stock', 'out_of_stock'
  previous_quantity INTEGER,
  current_quantity INTEGER,
  is_resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_inventory_alerts_product ON inventory_alerts(product_id);
CREATE INDEX idx_inventory_alerts_resolved ON inventory_alerts(is_resolved);
CREATE INDEX idx_inventory_alerts_type ON inventory_alerts(alert_type);

-- Function to create inventory alerts
CREATE OR REPLACE FUNCTION check_inventory_levels()
RETURNS TRIGGER AS $$
BEGIN
  -- Check for out of stock
  IF NEW.stock_quantity = 0 AND OLD.stock_quantity > 0 THEN
    INSERT INTO inventory_alerts (product_id, alert_type, previous_quantity, current_quantity)
    VALUES (NEW.id, 'out_of_stock', OLD.stock_quantity, NEW.stock_quantity);
  END IF;
  
  -- Check for low stock
  IF NEW.stock_quantity > 0 
     AND NEW.stock_quantity <= NEW.low_stock_threshold 
     AND OLD.stock_quantity > NEW.low_stock_threshold 
     AND NEW.notify_on_low_stock = TRUE THEN
    INSERT INTO inventory_alerts (product_id, alert_type, previous_quantity, current_quantity)
    VALUES (NEW.id, 'low_stock', OLD.stock_quantity, NEW.stock_quantity);
  END IF;
  
  -- Resolve alerts if stock is replenished
  IF NEW.stock_quantity > NEW.low_stock_threshold AND OLD.stock_quantity <= NEW.low_stock_threshold THEN
    UPDATE inventory_alerts
    SET is_resolved = TRUE, resolved_at = NOW()
    WHERE product_id = NEW.id AND is_resolved = FALSE;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to check inventory on stock updates
CREATE TRIGGER check_inventory_trigger
AFTER UPDATE OF stock_quantity ON products
FOR EACH ROW
EXECUTE FUNCTION check_inventory_levels();
