-- Migration 004: Advanced Inventory
-- Run with: psql $DATABASE_URL -f migrations/004_inventory_advanced.sql
-- Note: depends on 003_inventory_advanced.sql (warehouses table) from existing migrations.

-- Stock transfers (standalone, does not conflict with 003_inventory_advanced.sql)
CREATE TABLE IF NOT EXISTS low_stock_alerts (
  id            BIGSERIAL    PRIMARY KEY,
  product_id    BIGINT       NOT NULL REFERENCES products (id) ON DELETE CASCADE,
  warehouse_id  BIGINT       REFERENCES warehouses (id) ON DELETE SET NULL,
  threshold     INTEGER      NOT NULL DEFAULT 0,
  current_qty   INTEGER      NOT NULL DEFAULT 0,
  resolved      BOOLEAN      NOT NULL DEFAULT false,
  resolved_at   TIMESTAMPTZ,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_low_stock_alerts_product_id   ON low_stock_alerts (product_id);
CREATE INDEX IF NOT EXISTS idx_low_stock_alerts_resolved     ON low_stock_alerts (resolved);
CREATE INDEX IF NOT EXISTS idx_low_stock_alerts_created_at   ON low_stock_alerts (created_at DESC);

-- Add barcode column to products if it doesn't exist (idempotent)
ALTER TABLE products ADD COLUMN IF NOT EXISTS barcode VARCHAR(100) UNIQUE;

-- Sync history table used by syncController
CREATE TABLE IF NOT EXISTS sync_history (
  id          BIGSERIAL    PRIMARY KEY,
  sync_type   VARCHAR(100) NOT NULL,
  status      VARCHAR(50)  NOT NULL DEFAULT 'success'
                           CHECK (status IN ('success', 'error', 'partial')),
  message     TEXT,
  meta        JSONB,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sync_history_sync_type   ON sync_history (sync_type);
CREATE INDEX IF NOT EXISTS idx_sync_history_status      ON sync_history (status);
CREATE INDEX IF NOT EXISTS idx_sync_history_created_at  ON sync_history (created_at DESC);
