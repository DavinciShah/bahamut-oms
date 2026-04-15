const express = require('express');
const router = express.Router();
const productsController = require('../controllers/productsController');
const { authenticateToken } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/roleCheck');
const { validateProduct, handleValidationErrors } = require('../middleware/validation');

router.get('/', productsController.getProducts);
router.get('/:id/stock', productsController.getStockInfo);
router.get('/:id', productsController.getProductById);
router.post('/', authenticateToken, requireAdmin, validateProduct, handleValidationErrors, productsController.createProduct);
router.put('/:id', authenticateToken, requireAdmin, productsController.updateProduct);
router.delete('/:id', authenticateToken, requireAdmin, productsController.deleteProduct);
router.put('/:id/stock', authenticateToken, requireAdmin, productsController.updateStock);

module.exports = router;
