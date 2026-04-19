const express = require('express');
const router = express.Router();
const integrationController = require('../controllers/integrationController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

router.use(authMiddleware, adminMiddleware);

router.get('/', integrationController.getAll);
router.post('/connect', integrationController.connect);
router.get('/:id', integrationController.getById);
router.put('/:id', integrationController.update);
router.delete('/:id', integrationController.delete);
router.get('/:id/status', integrationController.getStatus);
router.post('/:id/test', integrationController.testConnection);

module.exports = router;
