-- ============================================================
-- Kaaswinkel Database Schema
-- Run this in your PostgreSQL database to set up all tables
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- ADMIN USERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- PRODUCTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  short_description VARCHAR(500),
  price DECIMAL(10, 2) NOT NULL,
  cheese_type VARCHAR(100),
  weight_options JSONB DEFAULT '[]',
  images JSONB DEFAULT '[]',
  in_stock BOOLEAN DEFAULT true,
  stock_quantity INTEGER DEFAULT 0,
  featured BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for searching and filtering
CREATE INDEX IF NOT EXISTS idx_products_cheese_type ON products(cheese_type);
CREATE INDEX IF NOT EXISTS idx_products_in_stock ON products(in_stock);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);

-- ============================================================
-- ORDERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number VARCHAR(20) UNIQUE NOT NULL,
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(50),
  delivery_address TEXT NOT NULL,
  delivery_city VARCHAR(100) NOT NULL,
  delivery_postal_code VARCHAR(20) NOT NULL,
  notes TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  subtotal DECIMAL(10, 2) NOT NULL,
  delivery_cost DECIMAL(10, 2) DEFAULT 0,
  total_amount DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT valid_status CHECK (status IN ('pending', 'confirmed', 'shipped', 'completed', 'cancelled'))
);

CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_email ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);

-- ============================================================
-- ORDER ITEMS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name VARCHAR(255) NOT NULL,
  product_image VARCHAR(500),
  weight_option VARCHAR(100),
  unit_price DECIMAL(10, 2) NOT NULL,
  quantity INTEGER NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

-- ============================================================
-- SEQUENCE FOR ORDER NUMBERS
-- ============================================================
CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1000;

-- ============================================================
-- UPDATED_AT TRIGGER FUNCTION
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admin_users_updated_at
  BEFORE UPDATE ON admin_users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- SAMPLE PRODUCTS (Dutch cheese varieties)
-- ============================================================
INSERT INTO products (name, slug, description, short_description, price, cheese_type, images, in_stock, stock_quantity, featured, sort_order)
VALUES
  (
    'Oude Gouda (48+)',
    'oude-gouda-48',
    'Onze klassieke gerijpte Gouda, minimaal 18 maanden gerijpt op traditionele houten planken. Stevig van textuur met een rijke, karamelachtige smaak en lichte zoutkristallen. Perfect bij een borrelplankje of als finishing touch op pasta.',
    'Klassiek gerijpte Gouda, 18 maanden oud',
    8.50,
    'Gouda',
    '[]',
    true,
    25,
    true,
    1
  ),
  (
    'Jong Belegen',
    'jong-belegen',
    'Een zachte, romige kaas met een milde smaak. Ideaal voor op brood of als snack voor de kinderen. Gemaakt van volle koemelk van lokale boerderijen in de omgeving.',
    'Zacht en romig, mild van smaak',
    6.75,
    'Gouda',
    '[]',
    true,
    40,
    true,
    2
  ),
  (
    'Boerenkaas Naturel',
    'boerenkaas-naturel',
    'Ambachtelijke boerenkaas gemaakt van rauwe melk, direct van de boerderij. Ongestandaardiseerd en vol van karakter. Elke kaas is uniek door het seizoen en het voer van de koeien.',
    'Rauwe melk kaas van de boerderij',
    11.00,
    'Boerenkaas',
    '[]',
    true,
    15,
    true,
    3
  ),
  (
    'Kruidenkaas met Bieslook',
    'kruidenkaas-bieslook',
    'Verse zachte kaas doordrenkt met verse bieslook en een vleugje knoflook. Heerlijk op crackers, als dip of door een salade. Gemaakt van gepasteuriseerde koemelk.',
    'Verse kaas met bieslook en knoflook',
    7.25,
    'Kruidenkaas',
    '[]',
    true,
    20,
    false,
    4
  ),
  (
    'Texelse Schapenkaas',
    'texelse-schapenkaas',
    'Originele Texelse schapenkaas met een uitgesproken, nootachtige smaak. Gerijpt gedurende 6 maanden. Uitstekend bij rode wijn of als onderdeel van een kaasplankje.',
    'Nootachtige schapenkaas van Texel',
    13.50,
    'Schapenkaas',
    '[]',
    true,
    10,
    true,
    5
  ),
  (
    'Geitenkaas Naturel',
    'geitenkaas-naturel',
    'Zachte, witte geitenkaas met een frisse, licht zure smaak. Ideaal voor op brood, in salades of als basis voor een elegant voorgerecht. Prachtig gecombineerd met honing en walnoten.',
    'Frisse zachte geitenkaas',
    9.00,
    'Geitenkaas',
    '[]',
    true,
    18,
    false,
    6
  )
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- DONE
-- ============================================================
-- To create your admin account, run the seed script:
-- npm run db:seed
-- Or manually insert with a hashed password (bcrypt, salt 12)
