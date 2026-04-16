const express = require('express');
const router = express.Router();
const shippingController = require('../controllers/shippingController');
const { authenticate } = require('../middleware/authMiddleware');

router.use(authenticate);

router.post('/rates', shippingController.getRates);
router.post('/shipments', shippingController.createShipment);
router.get('/shipments', shippingController.getShipments);
router.get('/shipments/:id', shippingController.getShipment);
router.delete('/shipments/:id', shippingController.cancelShipment);
router.get('/track/:trackingNumber', shippingController.getTracking);

module.exports = router;
