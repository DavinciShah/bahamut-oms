-- Fact Sales
CREATE TABLE IF NOT EXISTS fact_sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  customer_id UUID REFERENCES users(id) ON DELETE SET NULL,
  date_key DATE NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  revenue NUMERIC(15, 2) NOT NULL DEFAULT 0,
  cost NUMERIC(15, 2) NOT NULL DEFAULT 0,
  profit NUMERIC(15, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fact_sales_tenant ON fact_sales(tenant_id);
CREATE INDEX IF NOT EXISTS idx_fact_sales_date ON fact_sales(date_key);
CREATE INDEX IF NOT EXISTS idx_fact_sales_product ON fact_sales(product_id);
CREATE INDEX IF NOT EXISTS idx_fact_sales_customer ON fact_sales(customer_id);

-- Dimension: Customers
CREATE TABLE IF NOT EXISTS dim_customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  customer_name VARCHAR(255),
  email VARCHAR(255),
  city VARCHAR(100),
  country VARCHAR(100),
  segment VARCHAR(50),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dim_customers_tenant ON dim_customers(tenant_id);

-- Dimension: Products
CREATE TABLE IF NOT EXISTS dim_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  product_name VARCHAR(255),
  sku VARCHAR(100),
  category VARCHAR(100),
  brand VARCHAR(100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dim_products_tenant ON dim_products(tenant_id);

-- Dimension: Dates
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
