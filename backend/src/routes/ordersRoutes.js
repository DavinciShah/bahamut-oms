const express = require('express');
const router = express.Router();
const ordersController = require('../controllers/ordersController');
const { authenticateToken } = require('../middleware/auth');
const { validateOrder, handleValidationErrors } = require('../middleware/validation');

router.get('/', authenticateToken, ordersController.getOrders);
router.post('/', authenticateToken, validateOrder, handleValidationErrors, ordersController.createOrder);
router.get('/:id', authenticateToken, ordersController.getOrderById);
router.put('/:id', authenticateToken, ordersController.updateOrderStatus);
router.delete('/:id', authenticateToken, ordersController.cancelOrder);
router.get('/:id/items', authenticateToken, ordersController.getOrderItems);

module.exports = router;
