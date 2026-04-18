-- Migration 001: Initial Schema
-- Run with: psql $DATABASE_URL -f migrations/001_init.sql

CREATE TABLE IF NOT EXISTS users (
  id           SERIAL        PRIMARY KEY,
  email        VARCHAR(255)  UNIQUE NOT NULL,
  username     VARCHAR(100),
  password     VARCHAR(255)  NOT NULL,
  role         VARCHAR(50)   NOT NULL DEFAULT 'user',
  created_at   TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
  id           SERIAL        PRIMARY KEY,
  name         VARCHAR(255)  NOT NULL,
  description  TEXT,
  price        DECIMAL(10,2) NOT NULL,
  stock        INT           NOT NULL DEFAULT 0,
  created_at   TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orders (
  id           SERIAL        PRIMARY KEY,
  user_id      INT           REFERENCES users(id),
  total        DECIMAL(10,2),
  status       VARCHAR(50)   NOT NULL DEFAULT 'pending',
  created_at   TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS order_items (
  id           SERIAL        PRIMARY KEY,
  order_id     INT           REFERENCES orders(id),
  product_id   INT           REFERENCES products(id),
  quantity     INT,
  price        DECIMAL(10,2)
);

CREATE INDEX IF NOT EXISTS idx_user_email  ON users(email);
CREATE INDEX IF NOT EXISTS idx_order_user  ON orders(user_id);
