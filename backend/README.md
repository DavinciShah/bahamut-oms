# Bahamut OMS — Backend

Node.js/Express REST API for the Bahamut Order Management System with PostgreSQL and JWT authentication.

## Prerequisites

- Node.js >= 14
- PostgreSQL >= 12

## Installation

```bash
cd backend
npm install
```

## Environment Setup

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

| Variable              | Description                        | Default  |
|-----------------------|------------------------------------|----------|
| `PORT`                | HTTP port                          | `3000`   |
| `DB_HOST`             | PostgreSQL host                    | —        |
| `DB_PORT`             | PostgreSQL port                    | `5432`   |
| `DB_USER`             | Database user                      | —        |
| `DB_PASSWORD`         | Database password                  | —        |
| `DB_NAME`             | Database name                      | —        |
| `JWT_SECRET`          | Secret for signing JWTs            | —        |
| `ACCOUNTING_API_KEY`  | External accounting integration key| —        |
| `ACCOUNTING_API_SECRET`| External accounting integration secret | —   |

## Database Migrations

Run the initial schema:

```bash
psql -U $DB_USER -d $DB_NAME -f migrations/001_init.sql
```

## Running

```bash
# Production
npm start

# Development
npm run dev
```

## Testing

```bash
npm test
```

## API Overview

| Prefix                    | Description                   |
|---------------------------|-------------------------------|
| `POST /api/auth/register` | Register a new user           |
| `POST /api/auth/login`    | Authenticate and get token    |
| `GET  /api/auth/profile`  | Current user profile          |
| `/api/users`              | User management (CRUD)        |
| `/api/orders`             | Order management (CRUD)       |
| `/api/products`           | Product/inventory management  |
| `/api/admin`              | Dashboard stats & reports     |
| `/api/integrations`       | Accounting integrations       |
| `/api/sync`               | Sync operations & logs        |
| `/api/accounting-reports` | Financial reports             |
| `GET /api/health`         | Health check                  |

All protected routes require `Authorization: Bearer <token>` header.

See `API_DOCS.md` for full endpoint documentation.

## Project Structure

```
backend/
├── migrations/          # SQL migration files
├── src/
│   ├── config/          # DB pool and auth config
│   ├── controllers/     # Route handlers
│   ├── middleware/      # Auth and error middleware
│   ├── models/          # Database model classes
│   ├── routes/          # Express routers
│   └── utils/           # Validators and logger
├── server.js            # Entry point
└── src/app.js           # Express app setup
```
