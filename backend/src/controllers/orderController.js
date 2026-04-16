const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');

const getAll = async (req, res, next) => {
  try {
    const filters = {};
    if (req.query.status) filters.status = req.query.status;
    if (req.query.user_id) filters.user_id = req.query.user_id;
    const orders = await Order.findAll(req.app.locals.db, filters);
    res.json({ orders });
  } catch (err) {
    next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const pool = req.app.locals.db;
    const order = await Order.findById(pool, req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    const items = await OrderItem.findByOrderId(pool, order.id);
    res.json({ order: { ...order, items } });
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  const pool = req.app.locals.db;
  const client = await pool.connect();
  try {
    const { notes, items, user_id } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Order must have at least one item' });
    }

    // Only admins may create orders on behalf of another user
    const effectiveUserId =
      req.user.role === 'admin' && user_id ? user_id : req.user.id;

    await client.query('BEGIN');

    const total_amount = items.reduce(
      (sum, item) => sum + parseFloat(item.unit_price) * parseInt(item.quantity, 10),
      0
    );

    const orderResult = await client.query(
      `INSERT INTO orders (user_id, status, total_amount, notes)
       VALUES ($1, 'pending', $2, $3) RETURNING *`,
      [effectiveUserId, total_amount, notes]
    );
    const order = orderResult.rows[0];

    // Batch insert all order items in a single query
    const valuePlaceholders = items.map(
      (_, i) => `($1, $${i * 3 + 2}, $${i * 3 + 3}, $${i * 3 + 4})`
    ).join(', ');
    const itemParams = [order.id];
    items.forEach((item) => {
      itemParams.push(item.product_id, item.quantity, item.unit_price);
    });
    const itemsResult = await client.query(
      `INSERT INTO order_items (order_id, product_id, quantity, unit_price)
       VALUES ${valuePlaceholders} RETURNING *`,
      itemParams
    );
    const orderItems = itemsResult.rows;

    await client.query('COMMIT');
    res.status(201).json({ order: { ...order, items: orderItems } });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
};

const updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!status) return res.status(400).json({ error: 'Status is required' });
    const order = await Order.updateStatus(req.app.locals.db, req.params.id, status);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json({ order });
  } catch (err) {
    next(err);
  }
};

const deleteOrder = async (req, res, next) => {
  try {
    const deleted = await Order.delete(req.app.locals.db, req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Order not found' });
    res.json({ message: 'Order deleted successfully' });
  } catch (err) {
    next(err);
  }
};

const getItems = async (req, res, next) => {
  try {
    const items = await OrderItem.findByOrderId(req.app.locals.db, req.params.id);
    res.json({ items });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAll, getById, create, updateStatus, delete: deleteOrder, getItems };
