# Supabase Setup (OMS)

## 1. Run schema in Supabase SQL Editor

Open Supabase Dashboard for your project and run the SQL from:
- backend/migrations/supabase_bootstrap.sql

This creates the full OMS schema in one pass (core + tenant + inventory + billing + analytics + shipping + support + data warehouse).

## 2. Optional SQL prompt for Supabase AI

Use this prompt in Supabase AI SQL if you prefer generated SQL:

"Create an idempotent PostgreSQL schema for an OMS app in the public schema with BIGSERIAL primary keys for core tables (users, tenants, products, orders, order_items), plus integrations/sync, auth token tables, notifications, inventory tables, billing tables (payments, invoices, subscriptions), analytics tables (analytics_events, reports, analytics_aggregates), shipping tables (shipments, tracking_events), support tables (tickets, ticket_messages, knowledge_articles), and data warehouse tables (fact_sales, dim_customers, dim_products, dim_dates). Use BIGINT foreign keys to users/orders/products to avoid UUID type mismatches, add useful indexes, JSONB defaults, status checks, and make all CREATE statements idempotent with IF NOT EXISTS." 

## 3. Set backend env to Supabase DB

In backend/.env set one of:
- SUPABASE_DB_URL=postgresql://...
- or DATABASE_URL=postgresql://...

Keep SUPABASE_URL, SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY set as applicable.

## 4. Quick verification

- backend: npm run test:smoke
- frontend: npm run build
- backend health: GET /health
