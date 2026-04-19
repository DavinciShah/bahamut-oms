'use strict';

const pool      = require('../config/database');
const Order     = require('../models/Order');
const OrderItem = require('../models/OrderItem');

function generateOrderNumber() {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `ORD-${date}-${rand}`;
}

async function getAllOrders() {
  return Order.findAll();
}

async function getOrderById(id) {
  const order = await Order.findById(id);
  if (!order) {
    const err = new Error('Order not found');
    err.status = 404;
    throw err;
  }
  const items = await OrderItem.findByOrderId(id);
  return { ...order, items };
}

async function getOrdersByUserId(userId) {
  return Order.findByUserId(userId);
}

async function createOrder({ customer_id, user_id, items = [], shipping_address = null, notes = null }) {
  const custId = customer_id || user_id;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

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
      enrichedItems.push({ ...item, unit_price: item.price || item.unit_price || product.price });
    }

    const totalCents = enrichedItems.reduce(
      (sum, item) => sum + Math.round(Number(item.unit_price) * 100) * item.quantity,
      0
    );
    const total_amount  = totalCents / 100;
    const order_number  = generateOrderNumber();

    const { rows: orderRows } = await client.query(
      `INSERT INTO orders (order_number, customer_id, total_amount, status, shipping_address, notes, created_at, updated_at)
       VALUES ($1, $2, $3, 'pending', $4, $5, NOW(), NOW())
       RETURNING *`,
      [order_number, custId, total_amount,
       shipping_address ? JSON.stringify(shipping_address) : null, notes]
    );
    const order = orderRows[0];

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
}

async function updateOrder(id, data) {
  const order = await Order.update(id, data);
  if (!order) {
    const err = new Error('Order not found');
    err.status = 404;
    throw err;
  }
  return order;
}

async function deleteOrder(id) {
  const deleted = await Order.delete(id);
  if (!deleted) {
    const err = new Error('Order not found');
    err.status = 404;
    throw err;
  }
}

async function cancelOrder(orderId) {
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
}

module.exports = {
  generateOrderNumber,
  getAllOrders,
  getOrderById,
  getOrdersByUserId,
  createOrder,
  updateOrder,
  deleteOrder,
  cancelOrder,
};
