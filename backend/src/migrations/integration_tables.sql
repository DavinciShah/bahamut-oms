-- Integration Tables Migration

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Integrations table
CREATE TABLE IF NOT EXISTS integrations (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL,
  type          VARCHAR(50) NOT NULL,
  name          VARCHAR(255) NOT NULL,
  config        JSONB DEFAULT '{}',
  status        VARCHAR(50) NOT NULL DEFAULT 'active',
  last_sync_at  TIMESTAMP WITH TIME ZONE,
  created_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_integrations_user_id ON integrations(user_id);
CREATE INDEX IF NOT EXISTS idx_integrations_type ON integrations(type);
CREATE INDEX IF NOT EXISTS idx_integrations_status ON integrations(status);

-- Sync logs table
CREATE TABLE IF NOT EXISTS sync_logs (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  integration_id  UUID NOT NULL REFERENCES integrations(id) ON DELETE CASCADE,
  type            VARCHAR(50) NOT NULL,
  status          VARCHAR(50) NOT NULL DEFAULT 'pending',
  records_total   INTEGER DEFAULT 0,
  records_synced  INTEGER DEFAULT 0,
  records_failed  INTEGER DEFAULT 0,
  details         JSONB,
  error           TEXT,
  completed_at    TIMESTAMP WITH TIME ZONE,
  created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sync_logs_integration_id ON sync_logs(integration_id);
CREATE INDEX IF NOT EXISTS idx_sync_logs_status ON sync_logs(status);
CREATE INDEX IF NOT EXISTS idx_sync_logs_type ON sync_logs(type);
CREATE INDEX IF NOT EXISTS idx_sync_logs_created_at ON sync_logs(created_at);

-- Webhooks table
CREATE TABLE IF NOT EXISTS webhooks (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  integration_id        UUID REFERENCES integrations(id) ON DELETE CASCADE,
  user_id               UUID NOT NULL,
  url                   TEXT NOT NULL,
  events                JSONB NOT NULL DEFAULT '[]',
  secret                VARCHAR(255),
  active                BOOLEAN NOT NULL DEFAULT TRUE,
  last_triggered_at     TIMESTAMP WITH TIME ZONE,
  last_trigger_status   VARCHAR(50),
  created_at            TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_webhooks_user_id ON webhooks(user_id);
CREATE INDEX IF NOT EXISTS idx_webhooks_integration_id ON webhooks(integration_id);
CREATE INDEX IF NOT EXISTS idx_webhooks_active ON webhooks(active);

-- Invoices table (core OMS table referenced by reconciliation)
CREATE TABLE IF NOT EXISTS invoices (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL,
  invoice_number  VARCHAR(100),
  customer_id     UUID,
  customer_name   VARCHAR(255),
  date            DATE,
  due_date        DATE,
  currency        VARCHAR(10) DEFAULT 'INR',
  subtotal        DECIMAL(15,2) DEFAULT 0,
  tax_total       DECIMAL(15,2) DEFAULT 0,
  total           DECIMAL(15,2) DEFAULT 0,
  status          VARCHAR(50) DEFAULT 'draft',
  external_id     VARCHAR(255),
  notes           TEXT,
  created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_external_id ON invoices(external_id);

-- Payments table (core OMS table referenced by reconciliation)
CREATE TABLE IF NOT EXISTS payments (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL,
  invoice_id      UUID REFERENCES invoices(id) ON DELETE SET NULL,
  amount          DECIMAL(15,2) NOT NULL DEFAULT 0,
  currency        VARCHAR(10) DEFAULT 'INR',
  date            DATE,
  method          VARCHAR(100),
  reference       VARCHAR(255),
  status          VARCHAR(50) DEFAULT 'pending',
  external_id     VARCHAR(255),
  notes           TEXT,
  created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_invoice_id ON payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payments_external_id ON payments(external_id);
