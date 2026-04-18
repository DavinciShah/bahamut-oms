-- Migration 002: Notifications
-- Run with: psql $DATABASE_URL -f migrations/002_notifications.sql

CREATE TABLE IF NOT EXISTS notifications (
  id            BIGSERIAL     PRIMARY KEY,
  user_id       BIGINT        NOT NULL,
  type          VARCHAR(100)  NOT NULL,
  title         VARCHAR(255)  NOT NULL,
  message       TEXT          NOT NULL,
  data          JSONB,
  read          BOOLEAN       NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id        ON notifications (user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read      ON notifications (user_id, read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at     ON notifications (created_at DESC);

-- Optional push token table used by pushService
CREATE TABLE IF NOT EXISTS push_tokens (
  id          BIGSERIAL   PRIMARY KEY,
  user_id     BIGINT      NOT NULL,
  token       TEXT        NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ,
  UNIQUE (user_id, token)
);
