-- Migration 004: Multi-tenancy
-- Run with: psql $DATABASE_URL -f migrations/004_multitenancy.sql

CREATE TABLE IF NOT EXISTS tenants (
  id          BIGSERIAL     PRIMARY KEY,
  name        VARCHAR(255)  NOT NULL,
  slug        VARCHAR(100)  NOT NULL UNIQUE,
  domain      VARCHAR(255)  UNIQUE,
  settings    JSONB         NOT NULL DEFAULT '{}',
  plan        VARCHAR(50)   NOT NULL DEFAULT 'free',
  active      BOOLEAN       NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tenants_slug   ON tenants (slug);
CREATE INDEX IF NOT EXISTS idx_tenants_domain ON tenants (domain);

CREATE TABLE IF NOT EXISTS tenant_users (
  id          BIGSERIAL   PRIMARY KEY,
  tenant_id   BIGINT      NOT NULL REFERENCES tenants (id) ON DELETE CASCADE,
  user_id     BIGINT      NOT NULL,
  role        VARCHAR(50) NOT NULL DEFAULT 'member',
  active      BOOLEAN     NOT NULL DEFAULT true,
  joined_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_tenant_users_tenant ON tenant_users (tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_users_user   ON tenant_users (user_id);

CREATE TABLE IF NOT EXISTS tenant_settings (
  id          BIGSERIAL   PRIMARY KEY,
  tenant_id   BIGINT      NOT NULL REFERENCES tenants (id) ON DELETE CASCADE,
  key         VARCHAR(100) NOT NULL,
  value       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, key)
);
