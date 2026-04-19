-- Migration 001: Initial Schema
-- Run with: psql $DATABASE_URL -f migrations/001_init.sql

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id               BIGSERIAL     PRIMARY KEY,
  name             VARCHAR(255),
  email            VARCHAR(255)  NOT NULL UNIQUE,
  username         VARCHAR(100),
  password         VARCHAR(255)  NOT NULL,
  role             VARCHAR(50)   NOT NULL DEFAULT 'user',
  phone            VARCHAR(50),
  active           BOOLEAN       NOT NULL DEFAULT true,
  email_verified   BOOLEAN       NOT NULL DEFAULT false,
  created_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email   ON users (email);
CREATE INDEX IF NOT EXISTS idx_users_role    ON users (role);
CREATE INDEX IF NOT EXISTS idx_users_active  ON users (active);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id               BIGSERIAL       PRIMARY KEY,
  name             VARCHAR(255)    NOT NULL,
  description      TEXT,
  sku              VARCHAR(100)    UNIQUE,
  price            NUMERIC(12, 2)  NOT NULL CHECK (price >= 0),
  stock_quantity   INTEGER         NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  category         VARCHAR(100),
  active           BOOLEAN         NOT NULL DEFAULT true,
  created_at       TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_sku       ON products (sku);
CREATE INDEX IF NOT EXISTS idx_products_category  ON products (category);
CREATE INDEX IF NOT EXISTS idx_products_active    ON products (active);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id               BIGSERIAL       PRIMARY KEY,
  order_number     VARCHAR(100)    UNIQUE,
  customer_id      BIGINT          NOT NULL REFERENCES users (id) ON DELETE RESTRICT,
  total_amount     NUMERIC(12, 2)  NOT NULL DEFAULT 0,
  status           VARCHAR(50)     NOT NULL DEFAULT 'pending'
                                   CHECK (status IN ('pending','confirmed','processing','shipped','delivered','cancelled')),
  shipping_address JSONB,
  notes            TEXT,
  created_at       TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_customer_id   ON orders (customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status        ON orders (status);
CREATE INDEX IF NOT EXISTS idx_orders_order_number  ON orders (order_number);
CREATE INDEX IF NOT EXISTS idx_orders_created_at    ON orders (created_at DESC);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
  id           BIGSERIAL       PRIMARY KEY,
  order_id     BIGINT          NOT NULL REFERENCES orders (id)   ON DELETE CASCADE,
  product_id   BIGINT          NOT NULL REFERENCES products (id) ON DELETE RESTRICT,
  quantity     INTEGER         NOT NULL CHECK (quantity > 0),
  unit_price   NUMERIC(12, 2)  NOT NULL CHECK (unit_price >= 0),
  total_price  NUMERIC(12, 2)  NOT NULL GENERATED ALWAYS AS (quantity * unit_price) STORED,
  created_at   TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id    ON order_items (order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id  ON order_items (product_id);
