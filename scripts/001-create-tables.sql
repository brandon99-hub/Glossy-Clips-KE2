-- Products table
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  category VARCHAR(100) NOT NULL, -- 'hair-charm' or 'gloss'
  images TEXT[] DEFAULT '{}',
  is_secret BOOLEAN DEFAULT FALSE, -- For secret menu items
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Orders table
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  reference_code VARCHAR(50) UNIQUE NOT NULL,
  customer_name VARCHAR(255) NOT NULL,
  phone_number VARCHAR(20) NOT NULL,
  pickup_location TEXT NOT NULL,
  items JSONB NOT NULL, -- [{product_id, name, quantity, price}]
  total_amount DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending', -- pending, paid, packed, collected
  mpesa_confirmed BOOLEAN DEFAULT FALSE,
  gift_card_id INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Gift cards table
CREATE TABLE gift_cards (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  value DECIMAL(10, 2) NOT NULL,
  order_id INTEGER REFERENCES orders(id),
  is_redeemed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Testimonials table
CREATE TABLE testimonials (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) NOT NULL,
  profile_image VARCHAR(500),
  message TEXT NOT NULL,
  emoji_reactions VARCHAR(100),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Secret QR codes table
CREATE TABLE secret_codes (
  id SERIAL PRIMARY KEY,
  code VARCHAR(100) UNIQUE NOT NULL,
  order_id INTEGER REFERENCES orders(id),
  discount_percent INTEGER DEFAULT 10,
  is_used BOOLEAN DEFAULT FALSE,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Admin users table (simple auth)
CREATE TABLE admin_users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_is_secret ON products(is_secret);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_reference ON orders(reference_code);
CREATE INDEX idx_secret_codes_code ON secret_codes(code);
