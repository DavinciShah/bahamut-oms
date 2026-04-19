# Database Schema

The database is PostgreSQL 15. The schema is initialised from `backend/migrations/init.sql`.

---

## Tables

### `users`

Stores registered user accounts.

| Column          | Type            | Constraints                              | Description                        |
|-----------------|-----------------|------------------------------------------|------------------------------------|
| `id`            | SERIAL          | PRIMARY KEY                              | Auto-incrementing user ID          |
| `name`          | VARCHAR(255)    | NOT NULL                                 | Full display name                  |
| `email`         | VARCHAR(255)    | UNIQUE NOT NULL                          | Login email address                |
| `password`      | VARCHAR(255)    | NOT NULL                                 | bcrypt-hashed password             |
| `role`          | VARCHAR(20)     | DEFAULT `'user'` CHECK IN (`admin`,`user`) | Access level                     |
| `refresh_token` | TEXT            | nullable                                 | Stored JWT refresh token           |
| `created_at`    | TIMESTAMP       | DEFAULT CURRENT_TIMESTAMP                | Row creation time                  |
| `updated_at`    | TIMESTAMP       | DEFAULT CURRENT_TIMESTAMP                | Last update time                   |

---

### `products`

Catalogue of items available for purchase.

| Column        | Type           | Constraints              | Description                       |
|---------------|----------------|--------------------------|-----------------------------------|
| `id`          | SERIAL         | PRIMARY KEY              | Auto-incrementing product ID      |
| `name`        | VARCHAR(255)   | NOT NULL                 | Product display name              |
| `description` | TEXT           | nullable                 | Long-form description             |
| `price`       | DECIMAL(10,2)  | NOT NULL                 | Unit price in default currency    |
| `stock`       | INTEGER        | DEFAULT 0                | Available inventory count         |
| `category`    | VARCHAR(100)   | nullable                 | Product category label            |
| `sku`         | VARCHAR(100)   | UNIQUE, nullable         | Stock-keeping unit identifier     |
| `created_at`  | TIMESTAMP      | DEFAULT CURRENT_TIMESTAMP| Row creation time                 |
| `updated_at`  | TIMESTAMP      | DEFAULT CURRENT_TIMESTAMP| Last update time                  |

---

### `orders`

Customer order headers.

| Column             | Type           | Constraints                                                      | Description                          |
|--------------------|----------------|------------------------------------------------------------------|--------------------------------------|
| `id`               | SERIAL         | PRIMARY KEY                                                      | Auto-incrementing order ID           |
| `user_id`          | INTEGER        | REFERENCES `users(id)` ON DELETE SET NULL                        | Owning user (nullable on user delete)|
| `status`           | VARCHAR(20)    | DEFAULT `'pending'` CHECK IN (`pending`,`processing`,`shipped`,`delivered`,`cancelled`) | Order lifecycle state |
| `total_amount`     | DECIMAL(10,2)  | DEFAULT 0                                                        | Computed sum of all line items       |
| `shipping_address` | TEXT           | nullable                                                         | Delivery address                     |
| `notes`            | TEXT           | nullable                                                         | Free-text customer notes             |
| `created_at`       | TIMESTAMP      | DEFAULT CURRENT_TIMESTAMP                                        | Order placed time                    |
| `updated_at`       | TIMESTAMP      | DEFAULT CURRENT_TIMESTAMP                                        | Last status change time              |

---

### `order_items`

Individual line items belonging to an order.

| Column       | Type          | Constraints                                    | Description                              |
|--------------|---------------|------------------------------------------------|------------------------------------------|
| `id`         | SERIAL        | PRIMARY KEY                                    | Auto-incrementing line item ID           |
| `order_id`   | INTEGER       | REFERENCES `orders(id)` ON DELETE CASCADE      | Parent order (deleted with the order)    |
| `product_id` | INTEGER       | REFERENCES `products(id)` ON DELETE SET NULL   | Referenced product (nullable on delete)  |
| `quantity`   | INTEGER       | NOT NULL                                       | Units ordered                            |
| `unit_price` | DECIMAL(10,2) | NOT NULL                                       | Price snapshot at time of purchase       |
| `created_at` | TIMESTAMP     | DEFAULT CURRENT_TIMESTAMP                      | Line item creation time                  |

---

## Relationships

```
users ──< orders            (one user → many orders; user_id SET NULL on user delete)
orders ──< order_items      (one order → many items; CASCADE delete)
products ──< order_items    (one product → many order items; product_id SET NULL on product delete)
```

---

## Indexes

| Index name                  | Table         | Column(s)   | Purpose                                         |
|-----------------------------|---------------|-------------|-------------------------------------------------|
| `idx_orders_user_id`        | `orders`      | `user_id`   | Fast lookup of orders by user                   |
| `idx_orders_status`         | `orders`      | `status`    | Fast filtering/reporting by order status        |
| `idx_order_items_order_id`  | `order_items` | `order_id`  | Fast retrieval of line items for an order       |
| `idx_users_email`           | `users`       | `email`     | Fast login lookup by email                      |
| `idx_products_sku`          | `products`    | `sku`       | Fast product lookup by SKU                      |

---

## Notes

- **Password storage**: Passwords are hashed with `bcryptjs` before being written to `users.password`. Plain-text passwords are never persisted.
- **Price snapshot**: `order_items.unit_price` stores the product price at the time the order was placed, preserving historical accuracy even if the product price changes later.
- **Soft deletes**: The schema does not use soft deletes. Deleting a user sets `orders.user_id` to NULL; deleting a product sets `order_items.product_id` to NULL; deleting an order cascades to its `order_items`.
- **Timestamps**: `updated_at` is not automatically updated by a trigger in the current schema; the application layer is responsible for setting it on update queries.
