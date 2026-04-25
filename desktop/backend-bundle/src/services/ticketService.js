const Ticket = require('../models/Ticket');
const TicketMessage = require('../models/TicketMessage');

const ticketService = {
  async createTicket(tenantId, data, userId) {
    return Ticket.create({ ...data, tenant_id: tenantId, customer_id: userId });
  },

  async getTickets(tenantId, options = {}) {
    return Ticket.findByTenant(tenantId, options);
  },

  async getTicketById(id) {
    return Ticket.findById(id);
  },

  async updateTicket(id, fields) {
    return Ticket.update(id, fields);
  },

  async deleteTicket(id) {
    return Ticket.delete(id);
  },

  async assignTicket(ticketId, userId) {
    return Ticket.assign(ticketId, userId);
  },

  async closeTicket(ticketId) {
    return Ticket.close(ticketId);
  },

  async addMessage(ticketId, senderId, message, attachments = []) {
    return TicketMessage.create({ ticket_id: ticketId, sender_id: senderId, message, attachments });
  },

  async getMessages(ticketId) {
    return TicketMessage.findByTicket(ticketId);
  }
};

module.exports = ticketService;
