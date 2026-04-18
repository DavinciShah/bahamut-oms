-- Migration 005: Billing (Payments, Invoices, Subscriptions)
-- Run with: psql $DATABASE_URL -f migrations/005_billing.sql

CREATE TABLE IF NOT EXISTS payments (
  id                   BIGSERIAL       PRIMARY KEY,
  tenant_id            BIGINT,
  order_id             BIGINT,
  amount               NUMERIC(12, 2)  NOT NULL,
  currency             CHAR(3)         NOT NULL DEFAULT 'usd',
  status               VARCHAR(50)     NOT NULL DEFAULT 'pending',
  provider             VARCHAR(50)     NOT NULL DEFAULT 'stripe',
  provider_payment_id  VARCHAR(255),
  metadata             JSONB,
  created_at           TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_tenant_id           ON payments (tenant_id);
CREATE INDEX IF NOT EXISTS idx_payments_order_id            ON payments (order_id);
CREATE INDEX IF NOT EXISTS idx_payments_provider_payment_id ON payments (provider_payment_id);

CREATE TABLE IF NOT EXISTS invoices (
  id           BIGSERIAL       PRIMARY KEY,
  tenant_id    BIGINT,
  customer_id  BIGINT,
  items        JSONB           NOT NULL DEFAULT '[]',
  subtotal     NUMERIC(12, 2)  NOT NULL DEFAULT 0,
  tax          NUMERIC(12, 2)  NOT NULL DEFAULT 0,
  total        NUMERIC(12, 2)  NOT NULL DEFAULT 0,
  status       VARCHAR(50)     NOT NULL DEFAULT 'draft',
  due_date     DATE,
  paid_at      TIMESTAMPTZ,
  created_at   TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invoices_tenant_id   ON invoices (tenant_id);
CREATE INDEX IF NOT EXISTS idx_invoices_customer_id ON invoices (customer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status      ON invoices (status);

CREATE TABLE IF NOT EXISTS subscriptions (
  id                      BIGSERIAL    PRIMARY KEY,
  tenant_id               BIGINT       NOT NULL,
  plan                    VARCHAR(100) NOT NULL,
  status                  VARCHAR(50)  NOT NULL DEFAULT 'active',
  stripe_subscription_id  VARCHAR(255) UNIQUE,
  current_period_start    TIMESTAMPTZ,
  current_period_end      TIMESTAMPTZ,
  created_at              TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_tenant_id             ON subscriptions (tenant_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription_id ON subscriptions (stripe_subscription_id);
