const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

router.get('/', authMiddleware, orderController.getAll);
router.post('/', authMiddleware, orderController.create);
router.get('/:id', authMiddleware, orderController.getById);
router.put('/:id', authMiddleware, orderController.updateStatus);
router.delete('/:id', authMiddleware, adminMiddleware, orderController.delete);
router.get('/:id/items', authMiddleware, orderController.getItems);

module.exports = router;
