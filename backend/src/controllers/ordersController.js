const ordersService = require('../services/ordersService');

const getOrders = async (req, res, next) => {
  try {
    const { page, limit, status } = req.query;
    const result = await ordersService.getOrders(req.user.id, req.user.role, page, limit, status);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

const createOrder = async (req, res, next) => {
  try {
    const order = await ordersService.createOrder(req.user.id, req.body);
    res.status(201).json({ success: true, data: { order } });
  } catch (err) {
    next(err);
  }
};

const getOrderById = async (req, res, next) => {
  try {
    const order = await ordersService.getOrderById(parseInt(req.params.id), req.user.id, req.user.role);
    res.status(200).json({ success: true, data: { order } });
  } catch (err) {
    next(err);
  }
};

const updateOrderStatus = async (req, res, next) => {
  try {
    const order = await ordersService.updateOrderStatus(parseInt(req.params.id), req.body.status, req.user.id, req.user.role);
    res.status(200).json({ success: true, data: { order } });
  } catch (err) {
    next(err);
  }
};

const cancelOrder = async (req, res, next) => {
  try {
    const order = await ordersService.cancelOrder(parseInt(req.params.id), req.user.id, req.user.role);
    res.status(200).json({ success: true, data: { order } });
  } catch (err) {
    next(err);
  }
};

const getOrderItems = async (req, res, next) => {
  try {
    const items = await ordersService.getOrderItems(parseInt(req.params.id), req.user.id, req.user.role);
    res.status(200).json({ success: true, data: { items } });
  } catch (err) {
    next(err);
  }
};

module.exports = { getOrders, createOrder, getOrderById, updateOrderStatus, cancelOrder, getOrderItems };
