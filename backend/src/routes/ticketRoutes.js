const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');
const { authenticate } = require('../middleware/authMiddleware');
const rateLimit = require('../middleware/rateLimitMiddleware');

router.use(rateLimit());
router.use(authenticate);

router.get('/tickets', ticketController.getTickets);
router.post('/tickets', ticketController.createTicket);
router.get('/tickets/:id', ticketController.getTicket);
router.put('/tickets/:id', ticketController.updateTicket);
router.delete('/tickets/:id', ticketController.deleteTicket);
router.post('/tickets/:id/messages', ticketController.addMessage);
router.get('/tickets/:id/messages', ticketController.getMessages);

router.get('/kb/articles', ticketController.getKBArticles);
router.post('/kb/articles', ticketController.createKBArticle);
router.get('/kb/articles/:id', ticketController.getKBArticle);
router.get('/kb/search', ticketController.searchKB);

router.post('/chat/start', ticketController.startChat);

module.exports = router;
