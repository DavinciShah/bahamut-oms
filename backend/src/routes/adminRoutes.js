const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

router.use(authMiddleware, adminMiddleware);

router.get('/stats', adminController.getDashboard);
router.get('/reports', adminController.getReports);
router.get('/inventory', adminController.getInventory);
router.get('/revenue', adminController.getRevenue);
router.get('/activity', adminController.getUserActivity);

module.exports = router;
