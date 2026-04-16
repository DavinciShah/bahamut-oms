# Bahamut OMS – Backend

Node.js/Express REST API powering the Bahamut Order Management System.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js ≥ 14 |
| Framework | Express 4 |
| Database | PostgreSQL (via `pg` pool) |
| Auth | JWT (access + refresh tokens), bcrypt |
| 2FA | TOTP (SHA-1 HMAC, 30-second window) |
| Real-time | Socket.io |
| Email | Nodemailer |
| Payments | Stripe |
| Shipping | DHL / FedEx / UPS |

---

## Quick Start

### 1. Install dependencies

```bash
cd backend
npm install
```

### 2. Configure environment

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | HTTP port | `3000` |
| `DB_HOST` | PostgreSQL host | `localhost` |
| `DB_PORT` | PostgreSQL port | `5432` |
| `DB_NAME` | Database name | `bahamut_oms` |
| `DB_USER` | Database user | `postgres` |
| `DB_PASSWORD` | Database password | – |
| `JWT_SECRET` | Access token secret (**must change**) | – |
| `JWT_EXPIRES_IN` | Access token TTL | `1h` |
| `REFRESH_TOKEN_SECRET` | Refresh token secret (**must change**) | – |
| `REFRESH_TOKEN_EXPIRES_IN` | Refresh token TTL | `7d` |
| `BCRYPT_ROUNDS` | bcrypt cost factor | `12` |
| `FRONTEND_URL` | Used in password-reset emails | `http://localhost:3001` |
| `LOG_LEVEL` | `error` / `warn` / `info` / `debug` | `info` |
| `LOG_FILE` | Optional file path for log output | – |

### 3. Run migrations

```bash
psql $DATABASE_URL -f migrations/001_init.sql
psql $DATABASE_URL -f migrations/002_auth_enhancements.sql
psql $DATABASE_URL -f migrations/003_invoicing.sql
psql $DATABASE_URL -f migrations/004_inventory_advanced.sql
psql $DATABASE_URL -f migrations/005_analytics.sql
```

> Existing migrations `002_notifications.sql` through `009_datawarehouse.sql`
> should be run in numerical order before the new ones.

### 4. Start the server

```bash
# Development
npm start

# Production (set NODE_ENV=production)
NODE_ENV=production npm start
```

---

## Project Structure

```
backend/
├── server.js                  # Entry point (HTTP + Socket.io)
├── src/
│   ├── app.js                 # Express app setup
│   ├── config/
│   │   ├── auth.js            # JWT / bcrypt config
│   │   └── database.js        # pg Pool singleton
│   ├── controllers/           # Route handler functions
│   ├── middleware/
│   │   ├── auth.js            # JWT authenticate + requireRole
│   │   ├── authMiddleware.js  # Legacy alias
│   │   ├── errorHandler.js    # Global error handler
│   │   └── rateLimitMiddleware.js
│   ├── models/                # Plain-object data-access layers
│   │   ├── User.js
│   │   ├── Product.js
│   │   ├── Order.js
│   │   └── OrderItem.js
│   ├── routes/                # Express routers
│   ├── services/              # Business-logic services
│   │   ├── authService.js
│   │   ├── otpService.js
│   │   ├── orderService.js
│   │   └── accountingService.js
│   └── utils/
│       ├── logger.js
│       └── validators.js
├── migrations/                # SQL migration scripts
└── tests/                     # Jest test suites
```

---

## Running Tests

```bash
npm test
```

Tests mock the PostgreSQL pool so no live database is required.

---

## Architecture Notes

### Authentication Flow

1. Client `POST /api/auth/login` → receives `{ token, refreshToken }`.
2. Client sends `Authorization: Bearer <token>` on every protected request.
3. When the access token expires, client `POST /api/auth/refresh-token` with `{ refreshToken }`.
4. On logout, the refresh token is revoked server-side.

### Order Status Workflow

```
pending → confirmed → processing → shipped → delivered
    ↘         ↘           ↘          ↘
                        cancelled
```

### Error Response Format

All errors follow:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable description",
    "details": ["field-level errors (optional)"]
  }
}
```

---

## Security Checklist

- [x] Helmet sets security headers
- [x] Parameterized SQL queries (no string interpolation)
- [x] Passwords hashed with bcrypt (≥ 12 rounds)
- [x] JWT secrets from environment variables
- [x] Rate limiting via `express-rate-limit`
- [x] CORS configured
- [x] Input validation before any DB call
