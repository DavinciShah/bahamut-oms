-- 001_init.sql
-- Initial schema for Bahamut OMS
-- Run with: psql $DATABASE_URL -f migrations/001_init.sql

CREATE TABLE IF NOT EXISTS users (
  id           BIGSERIAL    PRIMARY KEY,
  email        VARCHAR(255) UNIQUE NOT NULL,
  username     VARCHAR(100),
  password     VARCHAR(255) NOT NULL,
  role         VARCHAR(50)  NOT NULL DEFAULT 'user',
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS products (
  id              BIGSERIAL      PRIMARY KEY,
  name            VARCHAR(255)   NOT NULL,
  description     TEXT,
  sku             VARCHAR(100)   NOT NULL UNIQUE,
  price           NUMERIC(12, 2) NOT NULL,
  stock_quantity  INTEGER        NOT NULL DEFAULT 0,
  category        VARCHAR(100),
  created_at      TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders (
  id            BIGSERIAL      PRIMARY KEY,
  user_id       BIGINT         REFERENCES users(id) ON DELETE SET NULL,
  status        VARCHAR(50)    NOT NULL DEFAULT 'pending',
  total_amount  NUMERIC(12, 2) NOT NULL DEFAULT 0,
  notes         TEXT,
  created_at    TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_items (
  id          BIGSERIAL      PRIMARY KEY,
  order_id    BIGINT         NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id  BIGINT         REFERENCES products(id) ON DELETE SET NULL,
  quantity    INTEGER        NOT NULL,
  unit_price  NUMERIC(12, 2) NOT NULL,
  created_at  TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS integrations (
  id           BIGSERIAL    PRIMARY KEY,
  user_id      BIGINT       REFERENCES users(id) ON DELETE SET NULL,
  type         VARCHAR(100) NOT NULL,
  name         VARCHAR(255) NOT NULL,
  config       JSONB        NOT NULL DEFAULT '{}',
  status       VARCHAR(50)  NOT NULL DEFAULT 'active',
  last_sync_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sync_logs (
  id              BIGSERIAL    PRIMARY KEY,
  integration_id  BIGINT       REFERENCES integrations(id) ON DELETE SET NULL,
  type            VARCHAR(100) NOT NULL,
  status          VARCHAR(50)  NOT NULL DEFAULT 'pending',
  records_synced  INTEGER      NOT NULL DEFAULT 0,
  error_message   TEXT,
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_users_email       ON users(email);
CREATE INDEX IF NOT EXISTS idx_orders_user_id    ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status     ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_products_sku      ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_integrations_user ON integrations(user_id);
CREATE INDEX IF NOT EXISTS idx_sync_logs_integ   ON sync_logs(integration_id);
CREATE INDEX IF NOT EXISTS idx_sync_logs_status  ON sync_logs(status);
