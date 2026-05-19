-- Integration Tables Migration (versioned)
-- Creates integration infrastructure and corrects payments/invoices schemas
-- to match what the backend Payment and Invoice models actually query.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─────────────────────────────────────────────
-- Integrations
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS integrations (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID NOT NULL,
  type         VARCHAR(50) NOT NULL,
  name         VARCHAR(255) NOT NULL,
  config       JSONB NOT NULL DEFAULT '{}',
  status       VARCHAR(50) NOT NULL DEFAULT 'active',
  last_sync_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_integrations_user_id ON integrations(user_id);
CREATE INDEX IF NOT EXISTS idx_integrations_type    ON integrations(type);
CREATE INDEX IF NOT EXISTS idx_integrations_status  ON integrations(status);

-- ─────────────────────────────────────────────
-- Sync Logs
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sync_logs (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  integration_id  UUID NOT NULL REFERENCES integrations(id) ON DELETE CASCADE,
  type            VARCHAR(50) NOT NULL,
  status          VARCHAR(50) NOT NULL DEFAULT 'pending',
  records_total   INTEGER NOT NULL DEFAULT 0,
  records_synced  INTEGER NOT NULL DEFAULT 0,
  records_failed  INTEGER NOT NULL DEFAULT 0,
  details         JSONB,
  error           TEXT,
  completed_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sync_logs_integration_id ON sync_logs(integration_id);
CREATE INDEX IF NOT EXISTS idx_sync_logs_status         ON sync_logs(status);
CREATE INDEX IF NOT EXISTS idx_sync_logs_type           ON sync_logs(type);
CREATE INDEX IF NOT EXISTS idx_sync_logs_created_at     ON sync_logs(created_at);

-- ─────────────────────────────────────────────
-- Webhooks
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS webhooks (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  integration_id      UUID REFERENCES integrations(id) ON DELETE CASCADE,
  user_id             UUID NOT NULL,
  url                 TEXT NOT NULL,
  events              JSONB NOT NULL DEFAULT '[]',
  secret              VARCHAR(255),
  active              BOOLEAN NOT NULL DEFAULT TRUE,
  last_triggered_at   TIMESTAMPTZ,
  last_trigger_status VARCHAR(50),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_webhooks_user_id        ON webhooks(user_id);
CREATE INDEX IF NOT EXISTS idx_webhooks_integration_id ON webhooks(integration_id);
CREATE INDEX IF NOT EXISTS idx_webhooks_active         ON webhooks(active);

-- ─────────────────────────────────────────────
-- Invoices  (schema matches Invoice model)
-- Columns: tenant_id, customer_id, items (JSONB), subtotal, tax,
--          total, status, due_date, paid_at, invoice_number, pdf_url
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS invoices (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id      UUID REFERENCES tenants(id) ON DELETE SET NULL,
  invoice_number VARCHAR(100),
  customer_id    UUID REFERENCES users(id) ON DELETE SET NULL,
  items          JSONB NOT NULL DEFAULT '[]',
  subtotal       DECIMAL(15,2) NOT NULL DEFAULT 0,
  tax            DECIMAL(15,2) NOT NULL DEFAULT 0,
  total          DECIMAL(15,2) NOT NULL DEFAULT 0,
  status         VARCHAR(50) NOT NULL DEFAULT 'draft',
  due_date       DATE,
  paid_at        TIMESTAMPTZ,
  pdf_url        TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invoices_tenant_id   ON invoices(tenant_id);
CREATE INDEX IF NOT EXISTS idx_invoices_customer_id ON invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status      ON invoices(status);

-- ─────────────────────────────────────────────
-- Payments  (schema matches Payment model)
-- Columns: tenant_id, order_id, amount, currency, status,
--          provider, provider_payment_id, metadata
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS payments (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id           UUID REFERENCES tenants(id) ON DELETE SET NULL,
  order_id            UUID REFERENCES orders(id) ON DELETE SET NULL,
  amount              DECIMAL(15,2) NOT NULL DEFAULT 0,
  currency            VARCHAR(10) NOT NULL DEFAULT 'usd',
  status              VARCHAR(50) NOT NULL DEFAULT 'pending',
  provider            VARCHAR(100),
  provider_payment_id VARCHAR(255),
  metadata            JSONB,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_tenant_id           ON payments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_payments_order_id            ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_provider_payment_id ON payments(provider_payment_id);
CREATE INDEX IF NOT EXISTS idx_payments_status              ON payments(status);
