'use strict';

const { Router } = require('express');
const router = Router();
const warehouseController = require('../controllers/warehouseController');
const { authenticate } = require('../middleware/authMiddleware');
const rateLimit = require('../middleware/rateLimitMiddleware');

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200 });

router.use(authenticate);
router.use(limiter);

router.get('/',          warehouseController.getAll);
router.post('/',         warehouseController.create);
router.get('/:id',       warehouseController.getById);
router.put('/:id',       warehouseController.update);
router.delete('/:id',    warehouseController.delete);
router.get('/:id/stats', warehouseController.getStats);

module.exports = router;
