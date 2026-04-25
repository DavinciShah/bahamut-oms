# Bahamut OMS — API Documentation

> **Canonical reference**: [`docs/API.md`](../docs/API.md) contains the full, detailed API documentation including request/response examples for every endpoint.

Base URL: `http://localhost:5000/api`

All protected endpoints require:
```
Authorization: Bearer <jwt_token>
```

Successful responses use the envelope format:
```json
{ "success": true, "data": { ... } }
```

Error responses:
```json
{ "success": false, "message": "Error description" }
```

---

## Route Summary

| Prefix                        | Auth Required | Admin Only | Description                            |
|-------------------------------|---------------|------------|----------------------------------------|
| `POST /api/auth/register`     | No            | No         | Register a new user                    |
| `POST /api/auth/login`        | No            | No         | Login and receive tokens               |
| `POST /api/auth/logout`       | Yes           | No         | Invalidate session                     |
| `GET  /api/auth/profile`      | Yes           | No         | Get authenticated user profile         |
| `POST /api/auth/refresh`      | Yes           | No         | Refresh access token                   |
| `/api/users`                  | Yes           | Varies     | User management (list/get/update/delete)|
| `/api/orders`                 | Yes           | No         | Order CRUD and line items              |
| `/api/products`               | Read: No      | Write: Yes | Product catalog and stock              |
| `/api/admin`                  | Yes           | Yes        | Dashboard stats and reports            |
| `/api/notifications`          | Yes           | No         | User notification management           |
| `/api/inventory`              | Yes           | No         | Multi-warehouse inventory management   |
| `/api/warehouses`             | Yes           | No         | Warehouse CRUD and stats               |
| `/api/tenants`                | Yes           | No         | Multi-tenant management                |
| `/api/payments`               | Yes (except webhook) | No  | Payments and refunds (Stripe)          |
| `/api/analytics`              | Yes           | No         | Analytics, custom reports, forecasting |
| `/api/shipping`               | Yes           | No         | Shipping rates, shipments, tracking    |
| `/api/support`                | Yes           | No         | Tickets, knowledge base, live chat     |
| `/api/bi`                     | Yes           | No         | BI dashboard, ETL, predictions         |
| `/api/webhooks`               | Yes (except accounting-events) | No | Outbound webhook management   |
| `/api/accounting-reports`     | Yes           | No         | Accounting reports (P&L, balance sheet, etc.) |
| `/api/integrations`           | Yes           | Yes        | Accounting integrations (QuickBooks, etc.) |
| `/api/sync`                   | Yes           | Yes        | Trigger and monitor data syncs         |
| `GET  /api/health`            | No            | No         | Server health check                    |

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
