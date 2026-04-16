-- Migration 005: Analytics & Accounting
-- Run with: psql $DATABASE_URL -f migrations/005_analytics.sql

-- Analytics events
CREATE TABLE IF NOT EXISTS analytics_events (
  id           BIGSERIAL    PRIMARY KEY,
  event_type   VARCHAR(100) NOT NULL,
  user_id      BIGINT       REFERENCES users (id) ON DELETE SET NULL,
  session_id   VARCHAR(255),
  properties   JSONB,
  ip_address   INET,
  user_agent   TEXT,
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_analytics_events_event_type  ON analytics_events (event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id     ON analytics_events (user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at  ON analytics_events (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_session_id  ON analytics_events (session_id);

-- Journal entries (double-entry accounting)
CREATE TABLE IF NOT EXISTS journal_entries (
  id              BIGSERIAL       PRIMARY KEY,
  date            DATE            NOT NULL DEFAULT CURRENT_DATE,
  description     VARCHAR(500)    NOT NULL,
  amount          NUMERIC(14, 2)  NOT NULL CHECK (amount > 0),
  debit_account   VARCHAR(100)    NOT NULL,
  credit_account  VARCHAR(100)    NOT NULL,
  reference       VARCHAR(255),
  created_by      BIGINT          REFERENCES users (id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_journal_entries_date           ON journal_entries (date DESC);
CREATE INDEX IF NOT EXISTS idx_journal_entries_debit_account  ON journal_entries (debit_account);
CREATE INDEX IF NOT EXISTS idx_journal_entries_credit_account ON journal_entries (credit_account);
CREATE INDEX IF NOT EXISTS idx_journal_entries_reference      ON journal_entries (reference);
CREATE INDEX IF NOT EXISTS idx_journal_entries_created_by     ON journal_entries (created_by);
