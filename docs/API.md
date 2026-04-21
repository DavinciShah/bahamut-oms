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

## Notifications

All `/api/notifications` routes require authentication.

### GET /api/notifications

List notifications for the authenticated user.

**Query params**: `limit` (default 50, max 100), `offset` (default 0), `unreadOnly` (true | false)

**Response 200**

```json
{
  "success": true,
  "data": [
    { "id": 1, "type": "order_update", "message": "Your order #42 has shipped", "read": false, "created_at": "2024-01-15T10:00:00.000Z" }
  ],
  "total": 1,
  "unreadCount": 1,
  "limit": 50,
  "offset": 0
}
```

---

### POST /api/notifications/:id/read

Mark a single notification as read.

**Response 200**

```json
{ "success": true, "data": { "id": 1, "read": true } }
```

---

### POST /api/notifications/read-all

Mark all notifications for the authenticated user as read.

**Response 200**

```json
{ "success": true, "updated": 5 }
```

---

### DELETE /api/notifications/:id

Delete a single notification.

**Response 200**

```json
{ "success": true, "message": "Notification deleted" }
```

---

### DELETE /api/notifications

Delete all notifications for the authenticated user.

**Response 200**

```json
{ "success": true, "deleted": 12 }
```

---

## Inventory

All `/api/inventory` routes require authentication.

### GET /api/inventory/stock-levels

Get current stock levels across warehouses.

**Query params**: `warehouseId`, `productId`, `limit` (default 50), `offset` (default 0)

**Response 200**

```json
{
  "success": true,
  "data": [
    { "product_id": 5, "warehouse_id": 1, "quantity": 80 }
  ],
  "total": 1
}
```

---

### POST /api/inventory/adjust

Adjust stock quantity for a product in a warehouse.

**Request body**

```json
{ "warehouseId": 1, "productId": 5, "quantity": -10, "reason": "damaged" }
```

**Response 200**

```json
{ "success": true, "data": { "product_id": 5, "warehouse_id": 1, "quantity": 70 } }
```

---

### POST /api/inventory/transfer

Transfer stock between warehouses.

**Request body**

```json
{ "fromWarehouseId": 1, "toWarehouseId": 2, "productId": 5, "quantity": 20 }
```

**Response 200**

```json
{ "success": true, "data": { "transferred": 20, "product_id": 5 } }
```

---

### GET /api/inventory/low-stock

Get products below a stock threshold.

**Query params**: `threshold` (default 10)

**Response 200**

```json
{
  "success": true,
  "data": [
    { "product_id": 9, "name": "Widget C", "sku": "WGT-C-001", "quantity": 3 }
  ]
}
```

---

### GET /api/inventory/history

Get stock adjustment history for a product.

**Query params**: `productId` (**required**), `warehouseId`

**Response 200**

```json
{
  "success": true,
  "data": [
    { "id": 7, "product_id": 5, "warehouse_id": 1, "delta": -10, "reason": "damaged", "created_at": "2024-01-15T10:00:00.000Z" }
  ]
}
```

---

## Warehouses

All `/api/warehouses` routes require authentication.

### GET /api/warehouses

List all warehouses.

**Query params**: `active` (true — return only active warehouses)

**Response 200**

```json
{
  "success": true,
  "data": [
    { "id": 1, "name": "Main Warehouse", "code": "WH-MAIN", "address": "1 Industrial Rd", "city": "Springfield", "country": "US", "active": true }
  ]
}
```

---

### POST /api/warehouses

Create a new warehouse.

**Request body**

```json
{ "name": "East Depot", "code": "WH-EAST", "address": "99 Dock St", "city": "Boston", "country": "US", "managerId": 3 }
```

**Response 201**

```json
{ "success": true, "data": { "id": 2, "name": "East Depot", "code": "WH-EAST", "active": true } }
```

---

### GET /api/warehouses/:id

Get a warehouse by ID.

**Response 200**

```json
{ "success": true, "data": { "id": 1, "name": "Main Warehouse", "code": "WH-MAIN" } }
```

---

### PUT /api/warehouses/:id

Update a warehouse.

**Request body** (all fields optional)

```json
{ "name": "Main Warehouse Updated", "managerId": 4 }
```

**Response 200**

```json
{ "success": true, "data": { "id": 1, "name": "Main Warehouse Updated" } }
```

---

### DELETE /api/warehouses/:id

Delete a warehouse.

**Response 200**

```json
{ "success": true, "message": "Warehouse deleted" }
```

---

### GET /api/warehouses/:id/stats

Get inventory statistics for a warehouse.

**Response 200**

```json
{
  "success": true,
  "data": { "total_products": 42, "total_units": 1540, "low_stock_count": 3 }
}
```

---

## Tenants

All `/api/tenants` routes require authentication.

### GET /api/tenants

List all tenants.

**Query params**: `active` (true — return only active tenants)

**Response 200**

```json
{ "success": true, "data": [ { "id": 1, "name": "Acme Corp", "slug": "acme", "plan": "pro" } ] }
```

---

### POST /api/tenants

Create a new tenant.

**Request body**

```json
{ "name": "Acme Corp", "slug": "acme", "domain": "acme.example.com", "plan": "pro", "settings": {} }
```

**Response 201**

```json
{ "success": true, "data": { "id": 1, "name": "Acme Corp", "slug": "acme" } }
```

---

### GET /api/tenants/:id

Get a tenant by ID.

**Response 200**

```json
{ "success": true, "data": { "id": 1, "name": "Acme Corp", "plan": "pro" } }
```

---

### PUT /api/tenants/:id

Update a tenant.

**Request body** (all fields optional)

```json
{ "plan": "enterprise", "settings": { "maxUsers": 100 } }
```

**Response 200**

```json
{ "success": true, "data": { "id": 1, "name": "Acme Corp", "plan": "enterprise" } }
```

---

### DELETE /api/tenants/:id

Delete a tenant.

**Response 200**

```json
{ "success": true, "message": "Tenant deleted" }
```

---

### GET /api/tenants/:id/users

List users belonging to a tenant.

**Response 200**

```json
{ "success": true, "data": [ { "user_id": 2, "name": "Bob", "role": "admin" } ] }
```

---

### POST /api/tenants/:id/users

Add a user to a tenant.

**Request body**

```json
{ "userId": 2, "role": "member" }
```

**Response 201**

```json
{ "success": true, "data": { "tenant_id": 1, "user_id": 2, "role": "member" } }
```

---

### DELETE /api/tenants/:id/users/:userId

Remove a user from a tenant.

**Response 200**

```json
{ "success": true, "message": "User removed from tenant" }
```

---

## Payments

All `/api/payments` routes (except the Stripe webhook) require authentication.

### POST /api/payments/webhook

Stripe webhook receiver. Accepts raw request body verified by Stripe signature. No authentication required.

---

### POST /api/payments/create

Create a payment for an order.

**Request body**

```json
{ "orderId": 42, "amount": 149.97, "currency": "USD", "method": "card", "metadata": {} }
```

**Response 201**

```json
{
  "success": true,
  "data": { "id": 7, "order_id": 42, "amount": "149.97", "currency": "USD", "status": "pending" }
}
```

---

### GET /api/payments

List payments.

**Query params**: `limit` (default 50), `offset` (default 0), `orderId`, `status`

**Response 200**

```json
{
  "success": true,
  "data": [ { "id": 7, "order_id": 42, "amount": "149.97", "status": "completed" } ],
  "total": 1
}
```

---

### GET /api/payments/:id

Get a payment by ID.

**Response 200**

```json
{ "success": true, "data": { "id": 7, "order_id": 42, "amount": "149.97", "status": "completed" } }
```

---

### POST /api/payments/:id/refund

Refund a payment (full or partial).

**Request body**

```json
{ "amount": 49.99 }
```

**Response 200**

```json
{ "success": true, "data": { "id": 7, "status": "refunded", "refunded_amount": "49.99" } }
```

---

## Analytics

All `/api/analytics` routes require authentication.

### GET /api/analytics/dashboard

High-level dashboard metrics for the tenant.

**Response 200**

```json
{ "total_orders": 320, "total_revenue": 48250.00, "active_users": 95 }
```

---

### GET /api/analytics/orders

Order analytics for a date range.

**Query params**: `from`, `to` (ISO 8601 dates)

**Response 200**

```json
{ "total": 85, "by_status": { "pending": 12, "shipped": 43, "delivered": 30 } }
```

---

### GET /api/analytics/revenue

Revenue analytics for a date range.

**Query params**: `from`, `to` (ISO 8601 dates)

**Response 200**

```json
{ "total_revenue": 12430.00, "by_month": [ { "month": "2024-01", "revenue": 2104.50 } ] }
```

---

### GET /api/analytics/products

Product performance analytics.

**Query params**: `from`, `to` (ISO 8601 dates)

**Response 200**

```json
{ "top_products": [ { "product_id": 5, "name": "Widget A", "units_sold": 120, "revenue": 5998.80 } ] }
```

---

### GET /api/analytics/reports

List saved custom reports for the tenant.

**Response 200**

```json
[ { "id": 3, "name": "Monthly Revenue", "type": "revenue", "created_at": "2024-01-01T00:00:00.000Z" } ]
```

---

### POST /api/analytics/reports

Create a new custom report.

**Request body**

```json
{ "name": "Q1 Orders", "type": "orders", "config": { "from": "2024-01-01", "to": "2024-03-31" } }
```

**Response 201**

```json
{ "id": 4, "name": "Q1 Orders", "type": "orders" }
```

---

### GET /api/analytics/reports/:id/run

Execute a saved report and return results.

**Response 200**

```json
{ "report": { "id": 4, "name": "Q1 Orders" }, "data": [ { "date": "2024-01-15", "count": 18 } ] }
```

---

### GET /api/analytics/reports/:id/export

Export a report as CSV or PDF.

**Query params**: `format` (csv | pdf, default csv)

**Response**: File download (`text/csv` or `application/pdf`).

---

### GET /api/analytics/forecast

Revenue forecast for upcoming periods.

**Query params**: `periods` (number of months to forecast, default 6)

**Response 200**

```json
{ "forecast": [ { "period": "2024-02", "predicted_revenue": 13200.00 } ] }
```

---

## Shipping

All `/api/shipping` routes require authentication.

### POST /api/shipping/rates

Get available shipping rates for a shipment.

**Request body**

```json
{
  "fromAddress": { "street": "1 Warehouse Ln", "city": "Chicago", "country": "US", "zip": "60601" },
  "toAddress": { "street": "42 Customer Ave", "city": "New York", "country": "US", "zip": "10001" },
  "packages": [ { "weight": 2, "dimensions": { "length": 10, "width": 8, "height": 4 } } ]
}
```

**Response 200**

```json
{ "rates": [ { "carrier": "UPS", "service": "Ground", "rate": 8.50, "estimated_days": 5 } ] }
```

---

### POST /api/shipping/shipments

Create a shipment.

**Request body**

```json
{
  "orderId": 42,
  "carrier": "UPS",
  "serviceCode": "03",
  "addresses": { "from": { ... }, "to": { ... } },
  "packages": [ { "weight": 2 } ]
}
```

**Response 201**

```json
{ "id": 11, "order_id": 42, "carrier": "UPS", "tracking_number": "1Z999AA10123456784", "status": "label_created" }
```

---

### GET /api/shipping/shipments

List shipments for the tenant.

**Query params**: `status`, `limit`, `offset`

**Response 200**

```json
{ "shipments": [ { "id": 11, "order_id": 42, "tracking_number": "1Z999AA10123456784", "status": "in_transit" } ] }
```

---

### GET /api/shipping/shipments/:id

Get a shipment with its tracking events.

**Response 200**

```json
{
  "id": 11,
  "order_id": 42,
  "tracking_number": "1Z999AA10123456784",
  "status": "in_transit",
  "tracking_events": [
    { "timestamp": "2024-01-15T08:00:00.000Z", "location": "Chicago, IL", "description": "Package picked up" }
  ]
}
```

---

### DELETE /api/shipping/shipments/:id

Cancel a shipment.

**Response 200**

```json
{ "id": 11, "status": "cancelled" }
```

---

### GET /api/shipping/track/:trackingNumber

Track a shipment by tracking number.

**Query params**: `carrier` (optional, narrows the carrier lookup)

**Response 200**

```json
{
  "tracking_number": "1Z999AA10123456784",
  "status": "in_transit",
  "events": [ { "timestamp": "2024-01-15T08:00:00.000Z", "description": "Package picked up" } ]
}
```

---

## Support

All `/api/support` routes require authentication.

### GET /api/support/tickets

List support tickets.

**Query params**: `status`, `priority`, `assigned_to`, `limit`, `offset`

**Response 200**

```json
[ { "id": 1, "subject": "Order missing", "status": "open", "priority": "high", "created_at": "2024-01-15T10:00:00.000Z" } ]
```

---

### POST /api/support/tickets

Create a support ticket.

**Request body**

```json
{ "subject": "Order missing", "description": "My order #42 hasn't arrived.", "priority": "high" }
```

**Response 201**

```json
{ "id": 2, "subject": "Order missing", "status": "open", "priority": "high" }
```

---

### GET /api/support/tickets/:id

Get a ticket by ID.

**Response 200**

```json
{ "id": 2, "subject": "Order missing", "status": "open", "priority": "high" }
```

---

### PUT /api/support/tickets/:id

Update a ticket's status or priority.

**Request body**

```json
{ "status": "in_progress", "assigned_to": 3 }
```

**Response 200**

```json
{ "id": 2, "status": "in_progress", "assigned_to": 3 }
```

---

### DELETE /api/support/tickets/:id

Delete a ticket.

**Response 200**

```json
{ "id": 2, "deleted": true }
```

---

### POST /api/support/tickets/:id/messages

Add a message to a ticket.

**Request body**

```json
{ "message": "We are looking into this issue.", "attachments": [] }
```

**Response 201**

```json
{ "id": 5, "ticket_id": 2, "sender_id": 3, "message": "We are looking into this issue.", "created_at": "2024-01-15T11:00:00.000Z" }
```

---

### GET /api/support/tickets/:id/messages

Get all messages for a ticket.

**Response 200**

```json
[ { "id": 5, "sender_id": 3, "message": "We are looking into this issue.", "created_at": "2024-01-15T11:00:00.000Z" } ]
```

---

### GET /api/support/kb/articles

List knowledge base articles for the tenant.

**Response 200**

```json
[ { "id": 1, "title": "How to track your order", "category": "orders", "views": 42 } ]
```

---

### POST /api/support/kb/articles

Create a knowledge base article.

**Request body**

```json
{ "title": "How to track your order", "body": "...", "category": "orders" }
```

**Response 201**

```json
{ "id": 1, "title": "How to track your order", "category": "orders" }
```

---

### GET /api/support/kb/articles/:id

Get a knowledge base article by ID (also increments view count).

**Response 200**

```json
{ "id": 1, "title": "How to track your order", "body": "...", "views": 43 }
```

---

### GET /api/support/kb/search

Search knowledge base articles.

**Query params**: `q` (**required**)

**Response 200**

```json
[ { "id": 1, "title": "How to track your order", "category": "orders" } ]
```

---

### POST /api/support/chat/start

Start a live chat session.

**Request body**

```json
{ "agentId": 4 }
```

**Response 201**

```json
{ "sessionId": "chat-abc123", "userId": 1, "agentId": 4, "startedAt": "2024-01-15T10:00:00.000Z" }
```

---

## Business Intelligence

All `/api/bi` routes require authentication.

### GET /api/bi/dashboard

BI summary dashboard including churn risk count, near-term revenue predictions, and anomaly alerts.

**Response 200**

```json
{
  "churn_risk_count": 5,
  "revenue_predictions": [ { "period": "2024-02", "predicted": 13200.00 } ],
  "anomaly_alerts": 2
}
```

---

### GET /api/bi/facts/sales

Query sales fact data from the data warehouse.

**Query params**: `from`, `to` (ISO 8601 dates), `dimension`, `metric`

**Response 200**: Array of fact rows or aggregated metrics.

---

### POST /api/bi/etl/run

Trigger an ETL pipeline run to populate the data warehouse.

**Request body**

```json
{ "from": "2024-01-01", "to": "2024-01-31" }
```

**Response 200**

```json
{ "status": "completed", "rows_processed": 1540 }
```

---

### GET /api/bi/predictions/revenue

Get revenue predictions for upcoming months.

**Query params**: `months` (number of months, default 6)

**Response 200**

```json
{ "predictions": [ { "period": "2024-02", "predicted_revenue": 13200.00 } ] }
```

---

### GET /api/bi/predictions/churn

Get customer churn risk predictions.

**Response 200**

```json
[ { "customer_id": 7, "churn_risk": "high", "score": 0.87 } ]
```

---

### GET /api/bi/anomalies

Get detected anomaly alerts for the tenant.

**Response 200**

```json
{ "total_alerts": 2, "alerts": [ { "type": "revenue_drop", "severity": "high", "detected_at": "2024-01-15T00:00:00.000Z" } ] }
```

---

## Webhooks

All management endpoints require authentication. The accounting-events endpoint is public (signature-verified).

### POST /api/webhooks/register

Register a new outbound webhook.

**Request body**

```json
{ "url": "https://example.com/hook", "events": ["order.created", "order.shipped"], "integrationId": 1, "secret": "mysecret" }
```

**Response 201**

```json
{ "success": true, "data": { "id": 3, "url": "https://example.com/hook", "events": ["order.created", "order.shipped"] } }
```

---

### GET /api/webhooks

List registered webhooks for the authenticated user.

**Response 200**

```json
{ "success": true, "data": [ { "id": 3, "url": "https://example.com/hook", "events": ["order.created"] } ] }
```

---

### DELETE /api/webhooks/:id

Delete a registered webhook.

**Response 200**

```json
{ "success": true, "message": "Webhook deleted" }
```

---

### POST /api/webhooks/test/:id

Send a test payload to a registered webhook endpoint.

**Response 200**

```json
{ "success": true, "data": { "status": 200, "duration_ms": 145 } }
```

---

### POST /api/webhooks/accounting-events

Receive inbound accounting events from external systems. Verified by HMAC signature. No authentication header required.

**Request body**: Accounting event payload (provider-specific).

**Response 200**

```json
{ "success": true, "data": { "processed": true } }
```

---

## Accounting Reports

All `/api/accounting-reports` routes require authentication.

### GET /api/accounting-reports/profit-loss

Profit & Loss report.

**Query params**: `from`, `to` (ISO 8601 dates)

**Response 200**

```json
{ "report": "profit_loss", "period": { "from": "2024-01-01", "to": "2024-01-31" }, "revenue": 12430.00, "expenses": 0, "netProfit": 12430.00 }
```

---

### GET /api/accounting-reports/balance-sheet

Balance sheet snapshot.

**Response 200**

```json
{
  "report": "balance_sheet",
  "assets": { "inventory": 52000.00, "accountsReceivable": 0, "cash": 48250.00 },
  "liabilities": { "accountsPayable": 0 }
}
```

---

### GET /api/accounting-reports/cash-flow

Monthly cash flow for the last 12 months.

**Response 200**

```json
{ "report": "cash_flow", "cashFlow": [ { "month": "2024-01-01T00:00:00.000Z", "cash_in": "12430.00" } ] }
```

---

### GET /api/accounting-reports/trial-balance

Trial balance grouped by order status/account.

**Response 200**

```json
{ "report": "trial_balance", "accounts": [ { "account": "completed", "debit": "48250.00", "credit": 0 } ] }
```

---

### GET /api/accounting-reports/journal

Last 100 journal entries.

**Response 200**

```json
{ "report": "journal", "entries": [ { "id": 42, "date": "2024-01-15T10:00:00.000Z", "entry_type": "Order", "amount": "149.97", "description": "completed" } ] }
```

---

### GET /api/accounting-reports/ledger

Ledger summary grouped by account.

**Response 200**

```json
{ "report": "ledger", "accounts": [ { "account": "completed", "transactions": 85, "balance": "48250.00" } ] }
```

---

### GET /api/accounting-reports/accounts

Chart of accounts.

**Response 200**

```json
{
  "report": "chart_of_accounts",
  "accounts": [
    { "code": "1000", "name": "Cash", "type": "asset" },
    { "code": "4000", "name": "Sales Revenue", "type": "revenue" }
  ]
}
```

---

## Integrations

All `/api/integrations` routes require authentication and the `admin` role.

### GET /api/integrations

List all integrations.

**Response 200**

```json
{ "integrations": [ { "id": 1, "name": "My QB", "type": "quickbooks", "status": "connected" } ] }
```

---

### POST /api/integrations/connect

Create a new integration.

**Request body**

```json
{ "type": "quickbooks", "name": "My QB", "config": { "clientId": "...", "clientSecret": "..." } }
```

**Response 201**

```json
{ "id": 1, "type": "quickbooks", "name": "My QB", "status": "pending" }
```

---

### GET /api/integrations/:id

Get an integration by ID.

**Response 200**

```json
{ "id": 1, "type": "quickbooks", "name": "My QB", "status": "connected" }
```

---

### PUT /api/integrations/:id

Update an integration's configuration or name.

**Request body**

```json
{ "name": "Updated QB", "config": { "apiKey": "new-key" } }
```

**Response 200**

```json
{ "id": 1, "name": "Updated QB", "status": "connected" }
```

---

### DELETE /api/integrations/:id

Delete an integration.

**Response 200**

```json
{ "message": "Integration deleted" }
```

---

### GET /api/integrations/:id/status

Get the connection status of an integration.

**Response 200**

```json
{ "id": 1, "status": "connected", "last_synced_at": "2024-01-15T08:00:00.000Z" }
```

---

### POST /api/integrations/:id/test

Test the connection for an integration.

**Response 200**

```json
{ "success": true, "latency_ms": 212 }
```

---

## Sync

All `/api/sync` routes require authentication and the `admin` role.

### POST /api/sync/invoices

Initiate an invoice sync.

**Request body**

```json
{ "integration_id": 1 }
```

**Response 200**

```json
{ "message": "invoices sync initiated", "type": "invoices", "status": "pending" }
```

---

### POST /api/sync/payments

Initiate a payments sync. Same body/response shape as `/sync/invoices`.

---

### POST /api/sync/expenses

Initiate an expenses sync. Same body/response shape as `/sync/invoices`.

---

### POST /api/sync/customers

Initiate a customers sync. Same body/response shape as `/sync/invoices`.

---

### POST /api/sync/products

Initiate a products sync. Same body/response shape as `/sync/invoices`.

---

### GET /api/sync/status

Get the last 50 sync log entries with integration details.

**Response 200**

```json
{
  "syncStatus": [
    { "id": 10, "integration_id": 1, "type": "invoices", "status": "completed", "records_synced": 18, "integration_name": "My QB", "created_at": "2024-01-15T08:00:00.000Z" }
  ]
}
```

---

### GET /api/sync/logs

Get the last 200 raw sync log entries.

**Response 200**

```json
{ "logs": [ { "id": 10, "integration_id": 1, "type": "invoices", "status": "completed", "records_synced": 18 } ] }
```

---

### POST /api/sync/retry

Retry a failed sync log entry.

**Request body**

```json
{ "log_id": 10 }
```

**Response 200**

```json
{ "message": "Sync retry initiated", "log": { "id": 10, "status": "pending" } }
```

---

## Health Check

### GET /api/health

Returns server health status. No authentication required.

**Response 200**

```json
{ "status": "OK", "timestamp": "2024-01-15T10:00:00.000Z" }
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
