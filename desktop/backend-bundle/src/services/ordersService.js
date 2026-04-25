const { pool } = require('../config/database');
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const Product = require('../models/Product');
const { createError } = require('../utils/errorHandler');

const getOrders = async (userId, role, page = 1, limit = 10, status) => {
  if (role === 'admin') {
    return await Order.findAll({ page: parseInt(page), limit: parseInt(limit), status });
  }
  return await Order.findByUserId(userId, { page: parseInt(page), limit: parseInt(limit) });
};

const createOrder = async (userId, { items, shippingAddress, notes }) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    let totalAmount = 0;
    const itemsWithPrice = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) throw createError(`Product ${item.productId} not found`, 404);
      if (product.stock < item.quantity) throw createError(`Insufficient stock for product ${product.name}`, 400);

      totalAmount += product.price * item.quantity;
      itemsWithPrice.push({ productId: item.productId, quantity: item.quantity, unitPrice: product.price });
    }

    const orderResult = await client.query(
      'INSERT INTO orders (user_id, shipping_address, notes, total_amount) VALUES ($1, $2, $3, $4) RETURNING *',
      [userId, shippingAddress, notes, totalAmount]
    );
    const order = orderResult.rows[0];

    for (const item of itemsWithPrice) {
      await client.query(
        'INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES ($1, $2, $3, $4)',
        [order.id, item.productId, item.quantity, item.unitPrice]
      );
      await client.query(
        'UPDATE products SET stock = stock - $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [item.quantity, item.productId]
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
};

const getOrderById = async (id, userId, role) => {
  const order = await Order.findById(id);
  if (!order) throw createError('Order not found', 404);
  if (role !== 'admin' && order.user_id !== userId) throw createError('Not authorized', 403);

  const items = await OrderItem.findByOrderId(id);
  return { ...order, items };
};

const updateOrderStatus = async (id, status, userId, role) => {
  const order = await Order.findById(id);
  if (!order) throw createError('Order not found', 404);
  if (role !== 'admin') throw createError('Admin access required', 403);

  const updated = await Order.update(id, { status });
  return updated;
};

const cancelOrder = async (id, userId, role) => {
  const order = await Order.findById(id);
  if (!order) throw createError('Order not found', 404);
  if (role !== 'admin' && order.user_id !== userId) throw createError('Not authorized', 403);

  if (['shipped', 'delivered'].includes(order.status)) {
    throw createError('Cannot cancel order that has been shipped or delivered', 400);
  }

  const updated = await Order.update(id, { status: 'cancelled' });
  return updated;
};

const getOrderItems = async (orderId, userId, role) => {
  const order = await Order.findById(orderId);
  if (!order) throw createError('Order not found', 404);
  if (role !== 'admin' && order.user_id !== userId) throw createError('Not authorized', 403);

  return await OrderItem.findByOrderId(orderId);
};

module.exports = { getOrders, createOrder, getOrderById, updateOrderStatus, cancelOrder, getOrderItems };
