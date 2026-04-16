const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

router.get('/', authMiddleware, productController.getAll);
router.post('/', authMiddleware, adminMiddleware, productController.create);
router.get('/:id', authMiddleware, productController.getById);
router.put('/:id', authMiddleware, adminMiddleware, productController.update);
router.delete('/:id', authMiddleware, adminMiddleware, productController.delete);
router.put('/:id/stock', authMiddleware, adminMiddleware, productController.updateStock);
router.get('/:id/stock', authMiddleware, productController.getStockLevel);

module.exports = router;
