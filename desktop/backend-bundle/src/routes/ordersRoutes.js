const express = require('express');
const router = express.Router();
const ordersController = require('../controllers/ordersController');
const { authenticateToken } = require('../middleware/auth');
const { validateOrder, validateOrderStatus, validateOrderId, handleValidationErrors } = require('../middleware/validation');

router.get('/', authenticateToken, ordersController.getOrders);
router.post('/', authenticateToken, validateOrder, handleValidationErrors, ordersController.createOrder);
router.get('/:id/items', authenticateToken, validateOrderId, handleValidationErrors, ordersController.getOrderItems);
router.get('/:id', authenticateToken, validateOrderId, handleValidationErrors, ordersController.getOrderById);
router.put('/:id', authenticateToken, validateOrderId, validateOrderStatus, handleValidationErrors, ordersController.updateOrderStatus);
router.delete('/:id', authenticateToken, validateOrderId, handleValidationErrors, ordersController.cancelOrder);

module.exports = router;
