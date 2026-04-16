'use strict';

const { Pool } = require('pg');
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const Product = require('../models/Product');

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT || 5432}/${process.env.DB_NAME}`,
});

/**
 * Generate a unique order number: ORD-YYYYMMDD-XXXXXX.
 */
function generateOrderNumber() {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `ORD-${date}-${rand}`;
}

/**
 * Calculate total from an array of { unit_price, quantity } items.
 */
function calculateOrderTotal(items) {
  return items.reduce((sum, item) => sum + Number(item.unit_price) * Number(item.quantity), 0);
}

const orderService = {
  generateOrderNumber,
  calculateOrderTotal,

  /**
   * Create an order with its items inside a transaction.
   * Validates stock availability and decrements stock.
   */
  async createOrder({ customer_id, items, shipping_address = null, notes = null }) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Lock products rows and fetch prices
      const enrichedItems = [];
      for (const item of items) {
        const { rows } = await client.query(
          'SELECT id, name, price, stock_quantity FROM products WHERE id = $1 FOR UPDATE',
          [item.product_id]
        );
        if (!rows[0]) {
          throw Object.assign(new Error(`Product ${item.product_id} not found`), { status: 404 });
        }
        const product = rows[0];
        if (product.stock_quantity < item.quantity) {
          throw Object.assign(
            new Error(`Insufficient stock for product '${product.name}': available ${product.stock_quantity}, requested ${item.quantity}`),
            { status: 422 }
          );
        }
        enrichedItems.push({ ...item, unit_price: product.price });
      }

      const total_amount = calculateOrderTotal(enrichedItems);
      const order_number = generateOrderNumber();

      // Insert order
      const { rows: orderRows } = await client.query(
        `INSERT INTO orders (order_number, customer_id, total_amount, status, shipping_address, notes, created_at, updated_at)
         VALUES ($1, $2, $3, 'pending', $4, $5, NOW(), NOW())
         RETURNING *`,
        [order_number, customer_id, total_amount,
         shipping_address ? JSON.stringify(shipping_address) : null, notes]
      );
      const order = orderRows[0];

      // Insert order items and decrement stock
      for (const item of enrichedItems) {
        const total_price = Number(item.unit_price) * Number(item.quantity);
        await client.query(
          `INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price, created_at)
           VALUES ($1, $2, $3, $4, $5, NOW())`,
          [order.id, item.product_id, item.quantity, item.unit_price, total_price]
        );
        await client.query(
          `UPDATE products SET stock_quantity = stock_quantity - $2, updated_at = NOW() WHERE id = $1`,
          [item.product_id, item.quantity]
        );
      }

      await client.query('COMMIT');

      const orderItems = await OrderItem.findByOrderId(order.id);
      return { ...order, items: orderItems };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },

  /**
   * Confirm a pending order.
   */
  async processOrder(orderId) {
    return Order.updateStatus(orderId, 'confirmed');
  },

  /**
   * Cancel an order and restore product stock.
   */
  async cancelOrder(orderId) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const order = await Order.findById(orderId);
      if (!order) throw Object.assign(new Error('Order not found'), { status: 404 });

      const allowed = Order.STATUS_TRANSITIONS[order.status];
      if (!allowed.includes('cancelled')) {
        throw Object.assign(
          new Error(`Cannot cancel an order with status '${order.status}'`),
          { status: 422 }
        );
      }

      await client.query(
        `UPDATE orders SET status = 'cancelled', updated_at = NOW() WHERE id = $1`,
        [orderId]
      );

      // Restore stock
      const items = await OrderItem.findByOrderId(orderId);
      for (const item of items) {
        await client.query(
          `UPDATE products SET stock_quantity = stock_quantity + $2, updated_at = NOW() WHERE id = $1`,
          [item.product_id, item.quantity]
        );
      }

      await client.query('COMMIT');
      return Order.findById(orderId);
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },

  /**
   * Advance order status with validation.
   */
  async updateOrderStatus(orderId, newStatus) {
    return Order.updateStatus(orderId, newStatus);
  },

  /**
   * Return a timeline of status changes (requires order_status_history table if present,
   * otherwise returns minimal info from the order itself).
   */
  async getOrderTimeline(orderId) {
    const { rows } = await pool.query(
      `SELECT * FROM orders WHERE id = $1`,
      [orderId]
    );
    if (!rows[0]) throw Object.assign(new Error('Order not found'), { status: 404 });
    const order = rows[0];
    return [
      { status: 'pending', timestamp: order.created_at, note: 'Order placed' },
      ...(order.status !== 'pending'
        ? [{ status: order.status, timestamp: order.updated_at, note: `Status updated to ${order.status}` }]
        : []),
    ];
  },
};

module.exports = orderService;
