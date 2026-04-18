-- Migration 001: Initial schema - users table
-- Run with: psql $DATABASE_URL -f migrations/001_init.sql

CREATE TABLE IF NOT EXISTS users (
    id          BIGSERIAL     PRIMARY KEY,
    email       VARCHAR(255)  UNIQUE NOT NULL,
    username    VARCHAR(100),
    password    VARCHAR(255)  NOT NULL,
    role        VARCHAR(50)   NOT NULL DEFAULT 'user',
    created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
