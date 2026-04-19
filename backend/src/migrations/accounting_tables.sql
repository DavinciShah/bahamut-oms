-- Accounting Tables Migration

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Chart of Accounts
CREATE TABLE IF NOT EXISTS accounting_accounts (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  integration_id  UUID REFERENCES integrations(id) ON DELETE SET NULL,
  user_id         UUID NOT NULL,
  code            VARCHAR(50),
  name            VARCHAR(255) NOT NULL,
  type            VARCHAR(50) NOT NULL CHECK (type IN ('asset', 'liability', 'equity', 'revenue', 'expense')),
  subtype         VARCHAR(100),
  balance         DECIMAL(15,2) NOT NULL DEFAULT 0,
  currency        VARCHAR(10) DEFAULT 'INR',
  description     TEXT,
  active          BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_accounting_accounts_user_id ON accounting_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_accounting_accounts_type ON accounting_accounts(type);
CREATE INDEX IF NOT EXISTS idx_accounting_accounts_integration ON accounting_accounts(integration_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_accounting_accounts_user_code
  ON accounting_accounts(user_id, code) WHERE code IS NOT NULL;

-- Journal Entries (double-entry bookkeeping)
CREATE TABLE IF NOT EXISTS journal_entries (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  integration_id  UUID REFERENCES integrations(id) ON DELETE SET NULL,
  user_id         UUID NOT NULL,
  date            DATE NOT NULL,
  reference       VARCHAR(255),
  description     TEXT,
  currency        VARCHAR(10) DEFAULT 'INR',
  total_debit     DECIMAL(15,2) NOT NULL DEFAULT 0,
  total_credit    DECIMAL(15,2) NOT NULL DEFAULT 0,
  status          VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'posted', 'synced', 'void')),
  external_id     VARCHAR(255),
  synced_at       TIMESTAMP WITH TIME ZONE,
  created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_journal_entries_user_id ON journal_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_date ON journal_entries(date);
CREATE INDEX IF NOT EXISTS idx_journal_entries_status ON journal_entries(status);
CREATE INDEX IF NOT EXISTS idx_journal_entries_integration ON journal_entries(integration_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_reference ON journal_entries(reference);

-- Journal Entry Details (individual debit/credit lines)
CREATE TABLE IF NOT EXISTS journal_entry_details (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  journal_entry_id  UUID NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
  account_id        UUID REFERENCES accounting_accounts(id) ON DELETE SET NULL,
  account_name      VARCHAR(255),
  debit             DECIMAL(15,2) NOT NULL DEFAULT 0,
  credit            DECIMAL(15,2) NOT NULL DEFAULT 0,
  description       TEXT,
  created_at        TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_jed_journal_entry_id ON journal_entry_details(journal_entry_id);
CREATE INDEX IF NOT EXISTS idx_jed_account_id ON journal_entry_details(account_id);

-- Constraint: at least one of debit or credit must be non-zero
ALTER TABLE journal_entry_details
  ADD CONSTRAINT chk_jed_nonzero CHECK (debit >= 0 AND credit >= 0 AND (debit > 0 OR credit > 0));
