const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/roleCheck');

router.use(authenticateToken, requireAdmin);

router.get('/stats', adminController.getStats);
router.get('/reports/orders', adminController.getOrdersReport);
router.get('/reports/inventory', adminController.getInventoryReport);
router.get('/reports/revenue', adminController.getRevenueReport);
router.get('/users/activity', adminController.getUserActivity);

module.exports = router;
