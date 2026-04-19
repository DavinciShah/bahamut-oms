# Bahamut OMS — API Documentation

Base URL: `http://localhost:3000/api`

All protected endpoints require:
```
Authorization: Bearer <jwt_token>
```

---

## Authentication

### POST /auth/register
Register a new user.

**Body**
```json
{ "name": "Alice", "email": "alice@example.com", "password": "Secret@123" }
```
**Response 201**
```json
{ "user": { "id": 1, "name": "Alice", "email": "alice@example.com", "role": "user" }, "token": "..." }
```

### POST /auth/login
Log in and receive a JWT.

**Body**
```json
{ "email": "alice@example.com", "password": "Secret@123" }
```
**Response 200**
```json
{ "user": { "id": 1, "name": "Alice", "email": "alice@example.com", "role": "user" }, "token": "..." }
```

### GET /auth/profile *(auth)*
Return the authenticated user's profile.

**Response 200**
```json
{ "user": { "id": 1, "name": "Alice", "email": "alice@example.com", "role": "user" } }
```

---

## Users *(auth required)*

### GET /users
List all users (passwords excluded). **admin only** not required, any authenticated user.

### POST /users *(admin)*
Create a user.

**Body** `{ "name", "email", "password", "role" }`

### GET /users/:id
Get user by ID.

### PUT /users/:id
Update user fields.

**Body** `{ "name"?, "email"?, "role"? }`

### DELETE /users/:id *(admin)*
Delete a user.

---

## Orders *(auth required)*

### GET /orders
List orders. Optional query params: `status`, `user_id`.

### POST /orders
Create an order with items.

**Body**
```json
{
  "notes": "Rush delivery",
  "items": [
    { "product_id": 1, "quantity": 2, "unit_price": 29.99 }
  ]
}
```

### GET /orders/:id
Get order with its items.

### PUT /orders/:id
Update order status.

**Body** `{ "status": "shipped" }`

### DELETE /orders/:id *(admin)*
Delete an order.

### GET /orders/:id/items
Get items for an order.

---

## Products *(auth required)*

### GET /products
List products. Optional query params: `category`, `search`.

### POST /products *(admin)*
Create a product.

**Body** `{ "name", "sku", "price", "description"?, "stock_quantity"?, "category"? }`

### GET /products/:id
Get product by ID.

### PUT /products/:id *(admin)*
Update product fields.

### DELETE /products/:id *(admin)*
Delete a product.

### PUT /products/:id/stock *(admin)*
Adjust stock by delta.

**Body** `{ "quantity": 10 }` (negative to decrease)

### GET /products/:id/stock
Get current stock level.

---

## Admin *(admin required)*

### GET /admin/stats
Dashboard statistics: total users, orders, products, revenue.

### GET /admin/reports
Order summary grouped by status.

### GET /admin/inventory
Inventory list with values.

### GET /admin/revenue
Monthly revenue for the last 12 months.

### GET /admin/activity
Top users by spending.

---

## Integrations *(admin required)*

### GET /integrations
List all integrations.

### POST /integrations/connect
Create a new integration.

**Body** `{ "type": "quickbooks", "name": "My QB", "config": { ... } }`

### GET /integrations/:id
Get integration by ID.

### PUT /integrations/:id
Update integration.

### DELETE /integrations/:id
Delete integration.

### GET /integrations/:id/status
Get connection status.

### POST /integrations/:id/test
Test integration connection.

---

## Sync *(admin required)*

### POST /sync/invoices
Sync invoices. **Body** `{ "integration_id": 1 }`

### POST /sync/payments
Sync payments.

### POST /sync/expenses
Sync expenses.

### POST /sync/customers
Sync customers.

### POST /sync/products
Sync products.

### GET /sync/status
Last 50 sync statuses.

### GET /sync/logs
Last 200 sync log entries.

### POST /sync/retry
Retry a failed sync. **Body** `{ "log_id": 5 }`

---

## Accounting Reports *(auth required)*

### GET /accounting-reports/profit-loss
Profit & Loss report. Optional query params: `from`, `to` (ISO dates).

### GET /accounting-reports/balance-sheet
Balance sheet snapshot.

### GET /accounting-reports/cash-flow
Monthly cash flow (last 12 months).

### GET /accounting-reports/trial-balance
Trial balance grouped by account.

### GET /accounting-reports/journal
Journal entries (last 100).

### GET /accounting-reports/ledger
Ledger summary by account.

### GET /accounting-reports/accounts
Chart of accounts.

---

## Health Check

### GET /health
```json
{ "status": "OK", "timestamp": "2024-01-01T00:00:00.000Z" }
```

---

## Error Responses

All errors return JSON:
```json
{ "error": "Human-readable message" }
```

| Status | Meaning                     |
|--------|-----------------------------|
| 400    | Bad request / validation    |
| 401    | Unauthenticated             |
| 403    | Forbidden (requires admin)  |
| 404    | Resource not found          |
| 409    | Conflict (e.g. duplicate)   |
| 500    | Internal server error       |
