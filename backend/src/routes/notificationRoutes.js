'use strict';

const { Router } = require('express');
const router = Router();
const notificationController = require('../controllers/notificationController');
const { authenticate } = require('../middleware/authMiddleware');

router.use(authenticate);

router.get('/', notificationController.getNotifications);
router.post('/read-all', notificationController.markAllRead);
router.post('/:id/read', notificationController.markRead);
router.delete('/', notificationController.deleteAll);
router.delete('/:id', notificationController.deleteNotification);

module.exports = router;
