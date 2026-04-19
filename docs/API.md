# API Documentation

Base URL: `http://localhost:5000/api`

All protected endpoints require a Bearer token in the `Authorization` header:

```
Authorization: Bearer <access_token>
```

Responses follow the envelope format:

```json
{ "success": true, "data": { ... } }
{ "success": false, "message": "Error description" }
```

---

## Authentication

### POST /api/auth/register

Register a new user account.

**Request body**

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "SecurePass1!"
}
```

**Response 201**

```json
{
  "success": true,
  "data": {
    "user": { "id": 1, "name": "Jane Doe", "email": "jane@example.com", "role": "user" },
    "accessToken": "<jwt>",
    "refreshToken": "<jwt>"
  }
}
```

---

### POST /api/auth/login

Authenticate and receive tokens.

**Request body**

```json
{
  "email": "jane@example.com",
  "password": "SecurePass1!"
}
```

**Response 200**

```json
{
  "success": true,
  "data": {
    "user": { "id": 1, "name": "Jane Doe", "email": "jane@example.com", "role": "user" },
    "accessToken": "<jwt>",
    "refreshToken": "<jwt>"
  }
}
```

---

### POST /api/auth/logout

Invalidate the current session. Requires authentication.

**Response 200**

```json
{ "success": true, "data": { "message": "Logged out successfully" } }
```

---

### GET /api/auth/profile

Get the authenticated user's profile. Requires authentication.

**Response 200**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Jane Doe",
    "email": "jane@example.com",
    "role": "user",
    "created_at": "2024-01-15T10:00:00.000Z"
  }
}
```

---

### POST /api/auth/refresh

Exchange a refresh token for a new access token.

**Request body**

```json
{ "refreshToken": "<refresh_jwt>" }
```

**Response 200**

```json
{
  "success": true,
  "data": { "accessToken": "<new_jwt>" }
}
```

---

## Users

All `/api/users` routes require authentication. Write and list operations require the `admin` role.

### GET /api/users

List all users. **Admin only.**

**Query params**: `page` (default 1), `limit` (default 20)

**Response 200**

```json
{
  "success": true,
  "data": {
    "users": [
      { "id": 1, "name": "Jane Doe", "email": "jane@example.com", "role": "user", "created_at": "..." }
    ],
    "total": 1,
    "page": 1,
    "limit": 20
  }
}
```

---

### GET /api/users/search

Search users by name or email. **Admin only.**

**Query params**: `q` (search term)

**Response 200**

```json
{
  "success": true,
  "data": {
    "users": [ { "id": 1, "name": "Jane Doe", "email": "jane@example.com", "role": "user" } ]
  }
}
```

---

### GET /api/users/:id

Get a user by ID. Authenticated users can only fetch their own profile; admins can fetch any.

**Response 200**

```json
{
  "success": true,
  "data": { "id": 1, "name": "Jane Doe", "email": "jane@example.com", "role": "user" }
}
```

---

### PUT /api/users/:id

Update a user's name or email. Users can only update their own record.

**Request body**

```json
{ "name": "Jane Smith", "email": "janesmith@example.com" }
```

**Response 200**

```json
{
  "success": true,
  "data": { "id": 1, "name": "Jane Smith", "email": "janesmith@example.com", "role": "user" }
}
```

---

### DELETE /api/users/:id

Delete a user. **Admin only.**

**Response 200**

```json
{ "success": true, "data": { "message": "User deleted successfully" } }
```

---

## Orders

All `/api/orders` routes require authentication.

### GET /api/orders

List orders. Regular users see only their own orders; admins see all.

**Query params**: `page`, `limit`, `status` (pending | processing | shipped | delivered | cancelled)

**Response 200**

```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "id": 42,
        "user_id": 1,
        "status": "pending",
        "total_amount": "99.99",
        "shipping_address": "123 Main St",
        "notes": null,
        "created_at": "2024-01-15T10:00:00.000Z"
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 20
  }
}
```

---

### POST /api/orders

Create a new order.

**Request body**

```json
{
  "shipping_address": "123 Main St, City, 10001",
  "notes": "Leave at door",
  "items": [
    { "product_id": 5, "quantity": 2 },
    { "product_id": 9, "quantity": 1 }
  ]
}
```

**Response 201**

```json
{
  "success": true,
  "data": {
    "id": 42,
    "user_id": 1,
    "status": "pending",
    "total_amount": "149.97",
    "shipping_address": "123 Main St, City, 10001",
    "items": [
      { "id": 1, "product_id": 5, "quantity": 2, "unit_price": "49.99" },
      { "id": 2, "product_id": 9, "quantity": 1, "unit_price": "49.99" }
    ]
  }
}
```

---

### GET /api/orders/:id

Get a single order by ID.

**Response 200**

```json
{
  "success": true,
  "data": {
    "id": 42,
    "user_id": 1,
    "status": "pending",
    "total_amount": "149.97",
    "shipping_address": "123 Main St",
    "created_at": "2024-01-15T10:00:00.000Z"
  }
}
```

---

### GET /api/orders/:id/items

Get the line items for an order.

**Response 200**

```json
{
  "success": true,
  "data": {
    "items": [
      { "id": 1, "product_id": 5, "product_name": "Widget A", "quantity": 2, "unit_price": "49.99" }
    ]
  }
}
```

---

### PUT /api/orders/:id

Update an order's status or shipping address.

**Request body**

```json
{ "status": "processing" }
```

**Response 200**

```json
{
  "success": true,
  "data": { "id": 42, "status": "processing" }
}
```

---

### DELETE /api/orders/:id

Cancel an order (sets status to `cancelled`).

**Response 200**

```json
{ "success": true, "data": { "message": "Order cancelled successfully" } }
```

---

## Products

Read endpoints are public. Write endpoints require authentication and the `admin` role.

### GET /api/products

List all products.

**Query params**: `page`, `limit`, `category`, `search`

**Response 200**

```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": 5,
        "name": "Widget A",
        "description": "A fine widget",
        "price": "49.99",
        "stock": 100,
        "category": "widgets",
        "sku": "WGT-A-001",
        "created_at": "2024-01-01T00:00:00.000Z"
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 20
  }
}
```

---

### GET /api/products/:id

Get a single product by ID.

**Response 200**

```json
{
  "success": true,
  "data": { "id": 5, "name": "Widget A", "price": "49.99", "stock": 100, "sku": "WGT-A-001" }
}
```

---

### GET /api/products/:id/stock

Get current stock level for a product.

**Response 200**

```json
{
  "success": true,
  "data": { "product_id": 5, "stock": 100 }
}
```

---

### POST /api/products

Create a new product. **Admin only.**

**Request body**

```json
{
  "name": "Widget B",
  "description": "An even finer widget",
  "price": 59.99,
  "stock": 50,
  "category": "widgets",
  "sku": "WGT-B-001"
}
```

**Response 201**

```json
{
  "success": true,
  "data": { "id": 6, "name": "Widget B", "price": "59.99", "stock": 50, "sku": "WGT-B-001" }
}
```

---

### PUT /api/products/:id

Update a product. **Admin only.**

**Request body** (all fields optional)

```json
{ "price": 54.99, "stock": 75 }
```

**Response 200**

```json
{
  "success": true,
  "data": { "id": 6, "name": "Widget B", "price": "54.99", "stock": 75 }
}
```

---

### PUT /api/products/:id/stock

Update stock quantity. **Admin only.**

**Request body**

```json
{ "stock": 200 }
```

**Response 200**

```json
{
  "success": true,
  "data": { "product_id": 6, "stock": 200 }
}
```

---

### DELETE /api/products/:id

Delete a product. **Admin only.**

**Response 200**

```json
{ "success": true, "data": { "message": "Product deleted successfully" } }
```

---

## Admin

All `/api/admin` routes require authentication and the `admin` role.

### GET /api/admin/stats

Dashboard summary statistics.

**Response 200**

```json
{
  "success": true,
  "data": {
    "totalOrders": 320,
    "totalRevenue": "48250.00",
    "totalUsers": 95,
    "totalProducts": 42,
    "pendingOrders": 12
  }
}
```

---

### GET /api/admin/reports/orders

Aggregated orders report.

**Query params**: `startDate`, `endDate` (ISO 8601)

**Response 200**

```json
{
  "success": true,
  "data": {
    "report": [
      { "date": "2024-01-15", "count": 18, "revenue": "2104.50" }
    ]
  }
}
```

---

### GET /api/admin/reports/inventory

Current inventory status report.

**Response 200**

```json
{
  "success": true,
  "data": {
    "report": [
      { "product_id": 5, "name": "Widget A", "sku": "WGT-A-001", "stock": 100, "low_stock": false }
    ]
  }
}
```

---

### GET /api/admin/reports/revenue

Revenue breakdown report.

**Query params**: `period` (daily | weekly | monthly)

**Response 200**

```json
{
  "success": true,
  "data": {
    "report": [
      { "period": "2024-01", "revenue": "12430.00", "orders": 85 }
    ]
  }
}
```

---

### GET /api/admin/users/activity

Recent user activity log.

**Response 200**

```json
{
  "success": true,
  "data": {
    "activity": [
      { "user_id": 1, "name": "Jane Doe", "last_order": "2024-01-15T10:00:00.000Z", "total_orders": 7 }
    ]
  }
}
```

---

## Health Check

### GET /health

Returns server health status. No authentication required.

**Response 200**

```json
{ "success": true, "data": { "status": "OK", "timestamp": "2024-01-15T10:00:00.000Z" } }
```

---

## Error Codes

| HTTP Status | Meaning                        |
|-------------|--------------------------------|
| 400         | Validation error / bad request |
| 401         | Missing or invalid token       |
| 403         | Insufficient permissions       |
| 404         | Resource not found             |
| 429         | Rate limit exceeded            |
| 500         | Internal server error          |
