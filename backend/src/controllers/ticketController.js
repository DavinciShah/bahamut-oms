const ticketService = require('../services/ticketService');
const knowledgeBaseService = require('../services/knowledgeBaseService');
const chatService = require('../services/chatService');

const ticketController = {
  async getTickets(req, res) {
    try {
      const tenantId = req.user.tenant_id;
      const { status, priority, assigned_to, limit, offset } = req.query;
      const tickets = await ticketService.getTickets(tenantId, { status, priority, assigned_to, limit, offset });
      res.json(tickets);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  },

  async createTicket(req, res) {
    try {
      const tenantId = req.user.tenant_id;
      const userId = req.user.id;
      const ticket = await ticketService.createTicket(tenantId, req.body, userId);
      res.status(201).json(ticket);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  },

  async getTicket(req, res) {
    try {
      const ticket = await ticketService.getTicketById(req.params.id);
      if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
      res.json(ticket);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  },

  async updateTicket(req, res) {
    try {
      const ticket = await ticketService.updateTicket(req.params.id, req.body);
      res.json(ticket);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  },

  async deleteTicket(req, res) {
    try {
      const ticket = await ticketService.deleteTicket(req.params.id);
      res.json(ticket);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  },

  async addMessage(req, res) {
    try {
      const senderId = req.user.id;
      const { message, attachments } = req.body;
      const msg = await ticketService.addMessage(req.params.id, senderId, message, attachments);
      res.status(201).json(msg);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  },

  async getMessages(req, res) {
    try {
      const messages = await ticketService.getMessages(req.params.id);
      res.json(messages);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  },

  async getKBArticles(req, res) {
    try {
      const tenantId = req.user.tenant_id;
      const articles = await knowledgeBaseService.getArticles(tenantId);
      res.json(articles);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  },

  async createKBArticle(req, res) {
    try {
      const tenantId = req.user.tenant_id;
      const userId = req.user.id;
      const article = await knowledgeBaseService.createArticle(tenantId, req.body, userId);
      res.status(201).json(article);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  },

  async getKBArticle(req, res) {
    try {
      const article = await knowledgeBaseService.getArticleById(req.params.id);
      if (!article) return res.status(404).json({ error: 'Article not found' });
      await knowledgeBaseService.incrementViews(req.params.id);
      res.json(article);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  },

  async searchKB(req, res) {
    try {
      const tenantId = req.user.tenant_id;
      const { q } = req.query;
      if (!q) return res.status(400).json({ error: 'Query parameter q is required' });
      const articles = await knowledgeBaseService.searchArticles(tenantId, q);
      res.json(articles);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  },

  async startChat(req, res) {
    try {
      const userId = req.user.id;
      const { agentId } = req.body;
      const session = chatService.startChat(userId, agentId);
      res.status(201).json(session);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  }
};

module.exports = ticketController;
