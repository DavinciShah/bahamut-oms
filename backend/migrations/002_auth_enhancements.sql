-- Migration 002: Auth Enhancements
-- Run with: psql $DATABASE_URL -f migrations/002_auth_enhancements.sql

-- Refresh tokens
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id           BIGSERIAL    PRIMARY KEY,
  user_id      BIGINT       NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  token_hash   TEXT         NOT NULL UNIQUE,
  expires_at   TIMESTAMPTZ  NOT NULL,
  revoked      BOOLEAN      NOT NULL DEFAULT false,
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id    ON refresh_tokens (user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token_hash ON refresh_tokens (token_hash);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires_at ON refresh_tokens (expires_at);

-- Password reset tokens
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id           BIGSERIAL    PRIMARY KEY,
  user_id      BIGINT       NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  token_hash   TEXT         NOT NULL UNIQUE,
  expires_at   TIMESTAMPTZ  NOT NULL,
  used         BOOLEAN      NOT NULL DEFAULT false,
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id    ON password_reset_tokens (user_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token_hash ON password_reset_tokens (token_hash);

-- Two-factor auth
CREATE TABLE IF NOT EXISTS two_factor_auth (
  id             BIGSERIAL    PRIMARY KEY,
  user_id        BIGINT       NOT NULL UNIQUE REFERENCES users (id) ON DELETE CASCADE,
  totp_secret    TEXT,
  enabled        BOOLEAN      NOT NULL DEFAULT false,
  backup_codes   JSONB,
  created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_two_factor_auth_user_id ON two_factor_auth (user_id);

-- Email verifications
CREATE TABLE IF NOT EXISTS email_verifications (
  id           BIGSERIAL    PRIMARY KEY,
  user_id      BIGINT       NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  token_hash   TEXT         NOT NULL UNIQUE,
  expires_at   TIMESTAMPTZ  NOT NULL,
  verified_at  TIMESTAMPTZ,
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_verifications_user_id    ON email_verifications (user_id);
CREATE INDEX IF NOT EXISTS idx_email_verifications_token_hash ON email_verifications (token_hash);
