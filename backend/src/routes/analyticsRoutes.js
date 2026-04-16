const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { authenticate } = require('../middleware/authMiddleware');
const rateLimit = require('../middleware/rateLimitMiddleware');

router.use(rateLimit());
router.use(authenticate);

router.get('/dashboard', analyticsController.getDashboard);
router.get('/orders', analyticsController.getOrderAnalytics);
router.get('/revenue', analyticsController.getRevenueAnalytics);
router.get('/products', analyticsController.getProductAnalytics);
router.get('/reports', analyticsController.getReports);
router.post('/reports', analyticsController.createReport);
router.get('/reports/:id/run', analyticsController.runReport);
router.get('/reports/:id/export', analyticsController.exportReport);
router.get('/forecast', analyticsController.getForecast);

module.exports = router;
