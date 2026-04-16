-- Migration 003: Advanced Inventory
-- Run with: psql $DATABASE_URL -f migrations/003_inventory_advanced.sql

CREATE TABLE IF NOT EXISTS warehouses (
  id          BIGSERIAL     PRIMARY KEY,
  name        VARCHAR(255)  NOT NULL,
  code        VARCHAR(50)   NOT NULL UNIQUE,
  address     TEXT,
  city        VARCHAR(100),
  country     VARCHAR(100),
  manager_id  BIGINT,
  active      BOOLEAN       NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS inventory_levels (
  id                BIGSERIAL   PRIMARY KEY,
  product_id        BIGINT      NOT NULL,
  warehouse_id      BIGINT      NOT NULL REFERENCES warehouses (id) ON DELETE CASCADE,
  quantity          INTEGER     NOT NULL DEFAULT 0,
  reserved_quantity INTEGER     NOT NULL DEFAULT 0,
  reorder_point     INTEGER     NOT NULL DEFAULT 0,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (product_id, warehouse_id)
);

CREATE INDEX IF NOT EXISTS idx_inventory_levels_product   ON inventory_levels (product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_levels_warehouse ON inventory_levels (warehouse_id);

CREATE TABLE IF NOT EXISTS stock_transfers (
  id                  BIGSERIAL   PRIMARY KEY,
  from_warehouse_id   BIGINT      NOT NULL REFERENCES warehouses (id),
  to_warehouse_id     BIGINT      NOT NULL REFERENCES warehouses (id),
  product_id          BIGINT      NOT NULL,
  quantity            INTEGER     NOT NULL,
  status              VARCHAR(50) NOT NULL DEFAULT 'pending',
  notes               TEXT,
  created_by          BIGINT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at        TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS stock_adjustments (
  id               BIGSERIAL   PRIMARY KEY,
  product_id       BIGINT      NOT NULL,
  warehouse_id     BIGINT      NOT NULL REFERENCES warehouses (id),
  quantity_change  INTEGER     NOT NULL,
  reason           TEXT,
  created_by       BIGINT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add barcode column to products if it doesn't exist
ALTER TABLE products ADD COLUMN IF NOT EXISTS barcode VARCHAR(100) UNIQUE;
