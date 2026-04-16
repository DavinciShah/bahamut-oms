const express = require('express');
const router = express.Router();
const biController = require('../controllers/biController');
const { authenticate } = require('../middleware/authMiddleware');

router.use(authenticate);

router.get('/dashboard', biController.getDashboard);
router.get('/facts/sales', biController.getFactSales);
router.post('/etl/run', biController.runETL);
router.get('/predictions/revenue', biController.getRevenuePredictions);
router.get('/predictions/churn', biController.getChurnPredictions);
router.get('/anomalies', biController.getAnomalies);

module.exports = router;
