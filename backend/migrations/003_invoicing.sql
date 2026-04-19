-- Migration 003: Invoicing
-- Run with: psql $DATABASE_URL -f migrations/003_invoicing.sql

-- Invoices
CREATE TABLE IF NOT EXISTS invoices (
  id             BIGSERIAL       PRIMARY KEY,
  invoice_number VARCHAR(100)    NOT NULL UNIQUE,
  order_id       BIGINT          REFERENCES orders (id) ON DELETE SET NULL,
  customer_id    BIGINT          NOT NULL REFERENCES users (id) ON DELETE RESTRICT,
  subtotal       NUMERIC(12, 2)  NOT NULL DEFAULT 0,
  tax            NUMERIC(12, 2)  NOT NULL DEFAULT 0,
  total          NUMERIC(12, 2)  NOT NULL DEFAULT 0,
  status         VARCHAR(50)     NOT NULL DEFAULT 'draft'
                                 CHECK (status IN ('draft','sent','paid','overdue','cancelled')),
  due_date       DATE,
  paid_at        TIMESTAMPTZ,
  notes          TEXT,
  created_at     TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invoices_customer_id     ON invoices (customer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_order_id        ON invoices (order_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status          ON invoices (status);
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_number  ON invoices (invoice_number);

-- Invoice items
CREATE TABLE IF NOT EXISTS invoice_items (
  id            BIGSERIAL       PRIMARY KEY,
  invoice_id    BIGINT          NOT NULL REFERENCES invoices (id) ON DELETE CASCADE,
  product_id    BIGINT          REFERENCES products (id) ON DELETE SET NULL,
  description   VARCHAR(500)    NOT NULL,
  quantity      INTEGER         NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price    NUMERIC(12, 2)  NOT NULL CHECK (unit_price >= 0),
  total_price   NUMERIC(12, 2)  NOT NULL,
  created_at    TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id ON invoice_items (invoice_id);

-- Email logs
CREATE TABLE IF NOT EXISTS email_logs (
  id           BIGSERIAL    PRIMARY KEY,
  recipient    VARCHAR(255) NOT NULL,
  subject      VARCHAR(500) NOT NULL,
  template     VARCHAR(100),
  status       VARCHAR(50)  NOT NULL DEFAULT 'queued'
                            CHECK (status IN ('queued','sent','failed','bounced')),
  sent_at      TIMESTAMPTZ,
  error        TEXT,
  metadata     JSONB,
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_logs_recipient  ON email_logs (recipient);
CREATE INDEX IF NOT EXISTS idx_email_logs_status     ON email_logs (status);
CREATE INDEX IF NOT EXISTS idx_email_logs_created_at ON email_logs (created_at DESC);
