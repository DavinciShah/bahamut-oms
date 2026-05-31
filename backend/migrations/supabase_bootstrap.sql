-- Supabase Bootstrap Schema (OMS)
-- Safe, idempotent schema for the current codebase.
-- Paste in Supabase SQL Editor and run once.

BEGIN;

-- Core users
CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  tenant_id BIGINT,
  name VARCHAR(255),
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(100),
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user', 'customer', 'agent', 'manager')),
  refresh_token TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_tenant ON users(tenant_id);

-- Tenants / multitenancy
CREATE TABLE IF NOT EXISTS tenants (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  domain VARCHAR(255) UNIQUE,
  settings JSONB NOT NULL DEFAULT '{}',
  plan VARCHAR(50) NOT NULL DEFAULT 'free',
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_tenants_slug ON tenants(slug);
CREATE INDEX IF NOT EXISTS idx_tenants_domain ON tenants(domain);

ALTER TABLE users
  ADD CONSTRAINT fk_users_tenant
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS tenant_users (
  id BIGSERIAL PRIMARY KEY,
  tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL DEFAULT 'member',
  active BOOLEAN NOT NULL DEFAULT true,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_tenant_users_tenant ON tenant_users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_users_user ON tenant_users(user_id);

CREATE TABLE IF NOT EXISTS tenant_settings (
  id BIGSERIAL PRIMARY KEY,
  tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  key VARCHAR(100) NOT NULL,
  value TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, key)
);

-- Catalog
CREATE TABLE IF NOT EXISTS products (
  id BIGSERIAL PRIMARY KEY,
  tenant_id BIGINT REFERENCES tenants(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price NUMERIC(12,2) NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  stock_quantity INTEGER,
  reorder_point INTEGER NOT NULL DEFAULT 0,
  category VARCHAR(100),
  sku VARCHAR(100) UNIQUE,
  barcode VARCHAR(100) UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_products_tenant ON products(tenant_id);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
  id BIGSERIAL PRIMARY KEY,
  tenant_id BIGINT REFERENCES tenants(id) ON DELETE SET NULL,
  user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  customer_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  order_number VARCHAR(100) UNIQUE,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  total_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  shipping_address TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_orders_tenant ON orders(tenant_id);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

CREATE TABLE IF NOT EXISTS order_items (
  id BIGSERIAL PRIMARY KEY,
  order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id BIGINT REFERENCES products(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(12,2) NOT NULL CHECK (unit_price >= 0),
  price NUMERIC(12,2) GENERATED ALWAYS AS (unit_price) STORED,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product ON order_items(product_id);

-- Integrations / sync
CREATE TABLE IF NOT EXISTS integrations (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  type VARCHAR(100) NOT NULL,
  name VARCHAR(255) NOT NULL,
  config JSONB NOT NULL DEFAULT '{}',
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  last_sync_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_integrations_user ON integrations(user_id);

CREATE TABLE IF NOT EXISTS sync_logs (
  id BIGSERIAL PRIMARY KEY,
  integration_id BIGINT REFERENCES integrations(id) ON DELETE SET NULL,
  type VARCHAR(100) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  records_synced INTEGER NOT NULL DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_sync_logs_integ ON sync_logs(integration_id);
CREATE INDEX IF NOT EXISTS idx_sync_logs_status ON sync_logs(status);

CREATE TABLE IF NOT EXISTS sync_history (
  id BIGSERIAL PRIMARY KEY,
  sync_type VARCHAR(100) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'success' CHECK (status IN ('success','error','partial')),
  message TEXT,
  meta JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_sync_history_type ON sync_history(sync_type);
CREATE INDEX IF NOT EXISTS idx_sync_history_status ON sync_history(status);

-- Auth enhancements
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  revoked BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);

CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);

CREATE TABLE IF NOT EXISTS two_factor_auth (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  totp_secret TEXT,
  enabled BOOLEAN NOT NULL DEFAULT false,
  backup_codes JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS email_verifications (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(100) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  data JSONB,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, read);

CREATE TABLE IF NOT EXISTS push_tokens (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ,
  UNIQUE (user_id, token)
);

-- Inventory
CREATE TABLE IF NOT EXISTS warehouses (
  id BIGSERIAL PRIMARY KEY,
  tenant_id BIGINT REFERENCES tenants(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) NOT NULL UNIQUE,
  address TEXT,
  city VARCHAR(100),
  country VARCHAR(100),
  manager_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS inventory_levels (
  id BIGSERIAL PRIMARY KEY,
  product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  warehouse_id BIGINT NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 0,
  reserved_quantity INTEGER NOT NULL DEFAULT 0,
  reorder_point INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (product_id, warehouse_id)
);
CREATE INDEX IF NOT EXISTS idx_inventory_levels_product ON inventory_levels(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_levels_warehouse ON inventory_levels(warehouse_id);

CREATE TABLE IF NOT EXISTS stock_transfers (
  id BIGSERIAL PRIMARY KEY,
  from_warehouse_id BIGINT NOT NULL REFERENCES warehouses(id),
  to_warehouse_id BIGINT NOT NULL REFERENCES warehouses(id),
  product_id BIGINT NOT NULL REFERENCES products(id),
  quantity INTEGER NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS stock_adjustments (
  id BIGSERIAL PRIMARY KEY,
  product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  warehouse_id BIGINT NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
  quantity_change INTEGER NOT NULL,
  reason TEXT,
  created_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS low_stock_alerts (
  id BIGSERIAL PRIMARY KEY,
  product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  warehouse_id BIGINT REFERENCES warehouses(id) ON DELETE SET NULL,
  threshold INTEGER NOT NULL DEFAULT 0,
  current_qty INTEGER NOT NULL DEFAULT 0,
  resolved BOOLEAN NOT NULL DEFAULT false,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Billing
CREATE TABLE IF NOT EXISTS payments (
  id BIGSERIAL PRIMARY KEY,
  tenant_id BIGINT REFERENCES tenants(id) ON DELETE SET NULL,
  order_id BIGINT REFERENCES orders(id) ON DELETE SET NULL,
  amount NUMERIC(12,2) NOT NULL,
  currency CHAR(3) NOT NULL DEFAULT 'usd',
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  provider VARCHAR(50) NOT NULL DEFAULT 'stripe',
  provider_payment_id VARCHAR(255),
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_payments_tenant_id ON payments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_provider_payment_id ON payments(provider_payment_id);

CREATE TABLE IF NOT EXISTS invoices (
  id BIGSERIAL PRIMARY KEY,
  tenant_id BIGINT REFERENCES tenants(id) ON DELETE SET NULL,
  customer_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  items JSONB NOT NULL DEFAULT '[]',
  subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
  tax NUMERIC(12,2) NOT NULL DEFAULT 0,
  total NUMERIC(12,2) NOT NULL DEFAULT 0,
  status VARCHAR(50) NOT NULL DEFAULT 'draft',
  due_date DATE,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_invoices_tenant_id ON invoices(tenant_id);
CREATE INDEX IF NOT EXISTS idx_invoices_customer_id ON invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);

CREATE TABLE IF NOT EXISTS subscriptions (
  id BIGSERIAL PRIMARY KEY,
  tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  plan VARCHAR(100) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  stripe_subscription_id VARCHAR(255) UNIQUE,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_subscriptions_tenant_id ON subscriptions(tenant_id);

-- Analytics
CREATE TABLE IF NOT EXISTS analytics_events (
  id BIGSERIAL PRIMARY KEY,
  tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  event_type VARCHAR(100) NOT NULL,
  data JSONB DEFAULT '{}',
  user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  session_id VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_analytics_events_tenant ON analytics_events(tenant_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created ON analytics_events(created_at);

CREATE TABLE IF NOT EXISTS reports (
  id BIGSERIAL PRIMARY KEY,
  tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(100) NOT NULL,
  config JSONB DEFAULT '{}',
  created_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_reports_tenant ON reports(tenant_id);

CREATE TABLE IF NOT EXISTS analytics_aggregates (
  id BIGSERIAL PRIMARY KEY,
  tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  period VARCHAR(20) NOT NULL,
  period_start TIMESTAMPTZ NOT NULL,
  metric VARCHAR(100) NOT NULL,
  value NUMERIC(20,4) DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, period, period_start, metric)
);
CREATE INDEX IF NOT EXISTS idx_aggregates_tenant_period ON analytics_aggregates(tenant_id, period, period_start);

-- Legacy/simple accounting table expected by accountingService
CREATE TABLE IF NOT EXISTS journal_entries (
  id BIGSERIAL PRIMARY KEY,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  description VARCHAR(500) NOT NULL,
  amount NUMERIC(14,2) NOT NULL CHECK (amount > 0),
  debit_account VARCHAR(100) NOT NULL,
  credit_account VARCHAR(100) NOT NULL,
  reference VARCHAR(255),
  created_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_journal_entries_date ON journal_entries(date DESC);

-- Shipping
CREATE TABLE IF NOT EXISTS shipments (
  id BIGSERIAL PRIMARY KEY,
  tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  order_id BIGINT REFERENCES orders(id) ON DELETE SET NULL,
  carrier VARCHAR(50) NOT NULL,
  tracking_number VARCHAR(100),
  status VARCHAR(50) NOT NULL DEFAULT 'created',
  from_address JSONB NOT NULL DEFAULT '{}',
  to_address JSONB NOT NULL DEFAULT '{}',
  weight NUMERIC(10,3),
  dimensions JSONB DEFAULT '{}',
  label_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_shipments_tenant ON shipments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_shipments_order ON shipments(order_id);

CREATE TABLE IF NOT EXISTS tracking_events (
  id BIGSERIAL PRIMARY KEY,
  shipment_id BIGINT NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
  status VARCHAR(100) NOT NULL,
  location VARCHAR(255),
  description TEXT,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_tracking_events_shipment ON tracking_events(shipment_id);

-- Support
CREATE TABLE IF NOT EXISTS tickets (
  id BIGSERIAL PRIMARY KEY,
  tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  customer_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  subject VARCHAR(500) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'open',
  priority VARCHAR(20) NOT NULL DEFAULT 'medium',
  category VARCHAR(100),
  assigned_to BIGINT REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  closed_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_tickets_tenant ON tickets(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tickets_customer ON tickets(customer_id);

CREATE TABLE IF NOT EXISTS ticket_messages (
  id BIGSERIAL PRIMARY KEY,
  ticket_id BIGINT NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  sender_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  message TEXT NOT NULL,
  attachments JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_ticket_messages_ticket ON ticket_messages(ticket_id);

CREATE TABLE IF NOT EXISTS knowledge_articles (
  id BIGSERIAL PRIMARY KEY,
  tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  content TEXT NOT NULL,
  tags JSONB DEFAULT '[]',
  views INTEGER NOT NULL DEFAULT 0,
  helpful_count INTEGER NOT NULL DEFAULT 0,
  created_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_kb_articles_tenant ON knowledge_articles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_kb_articles_fts ON knowledge_articles USING GIN(to_tsvector('english', title || ' ' || content));

-- Data warehouse
CREATE TABLE IF NOT EXISTS fact_sales (
  id BIGSERIAL PRIMARY KEY,
  tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  order_id BIGINT REFERENCES orders(id) ON DELETE SET NULL,
  product_id BIGINT REFERENCES products(id) ON DELETE SET NULL,
  customer_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  date_key DATE NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  revenue NUMERIC(15,2) NOT NULL DEFAULT 0,
  cost NUMERIC(15,2) NOT NULL DEFAULT 0,
  profit NUMERIC(15,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_fact_sales_tenant ON fact_sales(tenant_id);

CREATE TABLE IF NOT EXISTS dim_customers (
  id BIGSERIAL PRIMARY KEY,
  tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  customer_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  customer_name VARCHAR(255),
  email VARCHAR(255),
  city VARCHAR(100),
  country VARCHAR(100),
  segment VARCHAR(50),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS dim_products (
  id BIGSERIAL PRIMARY KEY,
  tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  product_id BIGINT REFERENCES products(id) ON DELETE CASCADE,
  product_name VARCHAR(255),
  sku VARCHAR(100),
  category VARCHAR(100),
  brand VARCHAR(100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS dim_dates (
  date_key DATE PRIMARY KEY,
  year INTEGER NOT NULL,
  quarter INTEGER NOT NULL,
  month INTEGER NOT NULL,
  month_name VARCHAR(20) NOT NULL,
  week INTEGER NOT NULL,
  day_of_week INTEGER NOT NULL,
  day_name VARCHAR(20) NOT NULL,
  is_weekend BOOLEAN NOT NULL DEFAULT false
);

INSERT INTO dim_dates (date_key, year, quarter, month, month_name, week, day_of_week, day_name, is_weekend)
SELECT
  d::date,
  EXTRACT(YEAR FROM d)::int,
  EXTRACT(QUARTER FROM d)::int,
  EXTRACT(MONTH FROM d)::int,
  TO_CHAR(d, 'Month'),
  EXTRACT(WEEK FROM d)::int,
  EXTRACT(DOW FROM d)::int,
  TO_CHAR(d, 'Day'),
  EXTRACT(DOW FROM d) IN (0, 6)
FROM generate_series('2020-01-01'::date, '2030-12-31'::date, '1 day'::interval) AS d
ON CONFLICT (date_key) DO NOTHING;

COMMIT;
