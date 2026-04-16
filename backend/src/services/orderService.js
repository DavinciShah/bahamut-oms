'use strict';

const Order     = require('../models/Order');
const OrderItem = require('../models/OrderItem');

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

async function createOrder({ user_id, items = [], status }) {
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const order = await Order.create({ user_id, total, status });

  for (const item of items) {
    await OrderItem.create({
      order_id:   order.id,
      product_id: item.product_id,
      quantity:   item.quantity,
      price:      item.price,
    });
  }

  return { ...order, items };
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

module.exports = {
  getAllOrders,
  getOrderById,
  getOrdersByUserId,
  createOrder,
  updateOrder,
  deleteOrder,
};
