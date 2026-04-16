'use strict';

const { Router } = require('express');
const router = Router();
const inventoryController = require('../controllers/inventoryController');
const { authenticate } = require('../middleware/authMiddleware');
const rateLimit = require('../middleware/rateLimitMiddleware');

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 300 });

router.use(authenticate);
router.use(limiter);

router.get('/stock-levels', inventoryController.getStockLevels);
router.post('/adjust',      inventoryController.adjustStock);
router.post('/transfer',    inventoryController.transferStock);
router.get('/low-stock',    inventoryController.getLowStockAlerts);
router.get('/history',      inventoryController.getStockHistory);

module.exports = router;
