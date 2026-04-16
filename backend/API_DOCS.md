# Bahamut OMS – API Documentation

Base URL: `http://localhost:3000/api`

All protected endpoints require:
```
Authorization: Bearer <access_token>
```

Errors always return:
```json
{ "error": { "code": "ERROR_CODE", "message": "Description" } }
```

---

## Authentication

### POST /auth/register

Create a new user account.

**Request**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "Secure@1234",
  "phone": "+12125551234"
}
```

**Response 201**
```json
{
  "token": "<access_token>",
  "refreshToken": "<refresh_token>",
  "user": { "id": 1, "name": "Jane Doe", "email": "jane@example.com", "role": "customer" }
}
```

**Errors** · `422` invalid input · `409` email already taken

---

### POST /auth/login

**Request**
```json
{ "email": "jane@example.com", "password": "Secure@1234" }
```

**Response 200**
```json
{
  "token": "<access_token>",
  "refreshToken": "<refresh_token>",
  "user": { "id": 1, "name": "Jane Doe", "email": "jane@example.com", "role": "customer" }
}
```

**Errors** · `401` wrong credentials · `403` account inactive

---

### GET /auth/profile *(auth required)*

**Response 200**
```json
{ "id": 1, "name": "Jane Doe", "email": "jane@example.com", "role": "customer" }
```

---

### POST /auth/refresh-token

**Request**
```json
{ "refreshToken": "<refresh_token>" }
```

**Response 200**
```json
{ "token": "<new_access_token>", "refreshToken": "<new_refresh_token>" }
```

---

### POST /auth/logout *(auth required)*

Revokes the current refresh token.

**Response 200**
```json
{ "message": "Logged out successfully" }
```

---

### POST /auth/forgot-password

**Request**
```json
{ "email": "jane@example.com" }
```

**Response 200**
```json
{ "message": "If that email exists, a reset link has been sent." }
```

---

### POST /auth/reset-password

**Request**
```json
{ "token": "<reset_token>", "password": "NewSecure@5678" }
```

**Response 200**
```json
{ "message": "Password reset successfully" }
```

---

## Users *(admin only)*

### GET /users

Query params: `?role=admin&active=true&limit=20&offset=0`

**Response 200**
```json
{
  "data": [{ "id": 1, "name": "Jane", "email": "jane@example.com", "role": "customer" }],
  "total": 1, "limit": 20, "offset": 0
}
```

---

### GET /users/:id *(auth required)*

**Response 200**
```json
{ "id": 1, "name": "Jane Doe", "email": "jane@example.com", "role": "customer" }
```

**Errors** · `404` not found

---

### PUT /users/:id *(auth required)*

**Request** (all fields optional)
```json
{ "name": "Jane Smith", "phone": "+12125550000" }
```

**Response 200** – updated user object

---

### DELETE /users/:id *(admin only)*

**Response 200**
```json
{ "message": "User deleted" }
```

---

## Products *(auth required)*

### GET /products

Query params: `?category=electronics&search=widget&active=true&limit=20&offset=0`

**Response 200**
```json
{
  "data": [{
    "id": 1, "name": "Blue Widget", "sku": "BW-001",
    "price": "9.99", "stock_quantity": 150, "category": "widgets", "active": true
  }],
  "total": 1
}
```

---

### GET /products/:id

**Response 200** – product object · **404** not found

---

### POST /products *(admin/staff)*

**Request**
```json
{
  "name": "Blue Widget", "description": "A small blue widget",
  "sku": "BW-001", "price": 9.99, "stock_quantity": 150,
  "category": "widgets"
}
```

**Response 201** – created product

**Errors** · `422` validation · `409` SKU conflict

---

### PUT /products/:id *(admin/staff)*

**Request** (partial update)
```json
{ "price": 11.99, "stock_quantity": 200 }
```

**Response 200** – updated product

---

### DELETE /products/:id *(admin only)*

**Response 200**
```json
{ "message": "Product deleted" }
```

---

## Orders *(auth required)*

### GET /orders

Query params: `?status=pending&customer_id=1&limit=20&offset=0`

**Response 200**
```json
{
  "data": [{
    "id": 1, "order_number": "ORD-20240101-AB1234",
    "customer_id": 2, "total_amount": "99.98",
    "status": "pending", "created_at": "2024-01-01T00:00:00Z"
  }],
  "total": 1
}
```

---

### GET /orders/:id

**Response 200**
```json
{
  "id": 1, "order_number": "ORD-20240101-AB1234",
  "status": "pending", "total_amount": "99.98",
  "items": [{ "product_id": 1, "quantity": 2, "unit_price": "9.99", "total_price": "19.98" }]
}
```

---

### POST /orders

**Request**
```json
{
  "customer_id": 2,
  "items": [{ "product_id": 1, "quantity": 3 }],
  "shipping_address": { "street": "123 Main St", "city": "New York", "country": "US" },
  "notes": "Leave at door"
}
```

**Response 201** – created order with items

**Errors** · `422` validation / insufficient stock

---

### PATCH /orders/:id/status *(admin/staff)*

**Request**
```json
{ "status": "confirmed" }
```

Valid transitions: `pending→confirmed→processing→shipped→delivered`, any→`cancelled`

**Response 200** – updated order · **422** invalid transition

---

### PATCH /orders/:id/cancel

**Response 200** – cancelled order (stock restored)

---

## Inventory *(auth required)*

### GET /inventory

### POST /inventory/adjust

**Request**
```json
{ "product_id": 1, "warehouse_id": 1, "quantity": -5, "reason": "Damaged goods" }
```

### POST /inventory/transfer

**Request**
```json
{ "from_warehouse_id": 1, "to_warehouse_id": 2, "product_id": 1, "quantity": 10 }
```

---

## Sync

### POST /sync/invoices *(admin)*
### POST /sync/payments *(admin)*
### POST /sync/expenses *(admin)*
### POST /sync/customers *(admin)*
### POST /sync/products *(admin)*
### POST /sync/all *(admin)*

All return:
```json
{ "success": true, "data": { "synced": 0, "errors": 0, "message": "..." } }
```

### GET /sync/status *(admin)*

```json
{
  "data": {
    "invoices":  { "status": "success", "created_at": "2024-01-01T00:00:00Z" },
    "payments":  { "status": "never_run", "created_at": null }
  }
}
```

### GET /sync/history *(admin)*

Query params: `?type=invoices&limit=20&offset=0`

---

## Accounting Reports *(admin)*

### GET /accounting-reports/trial-balance?startDate=&endDate=
### GET /accounting-reports/profit-loss?startDate=&endDate=
### GET /accounting-reports/balance-sheet?asOf=
### GET /accounting-reports/cash-flow?startDate=&endDate=
### GET /accounting-reports/journal-entries?startDate=&endDate=&account=

---

## Notifications *(auth required)*

### GET /notifications
### PATCH /notifications/:id/read
### PATCH /notifications/read-all

---

## Analytics *(admin)*

### GET /analytics/overview
### GET /analytics/sales?startDate=&endDate=
### GET /analytics/products/top
### GET /analytics/customers/top

---

## Health

### GET /health

```json
{ "status": "OK", "timestamp": "2024-01-01T00:00:00.000Z" }
```
