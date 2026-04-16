import apiClient from './apiClient';

const ticketService = {
  getTickets: (params) => apiClient.get('/support/tickets', { params }),
  createTicket: (data) => apiClient.post('/support/tickets', data),
  getTicket: (id) => apiClient.get(`/support/tickets/${id}`),
  updateTicket: (id, data) => apiClient.put(`/support/tickets/${id}`, data),
  deleteTicket: (id) => apiClient.delete(`/support/tickets/${id}`),
  addMessage: (id, data) => apiClient.post(`/support/tickets/${id}/messages`, data),
  getMessages: (id) => apiClient.get(`/support/tickets/${id}/messages`),
  getKBArticles: () => apiClient.get('/support/kb/articles'),
  createKBArticle: (data) => apiClient.post('/support/kb/articles', data),
  getKBArticle: (id) => apiClient.get(`/support/kb/articles/${id}`),
  searchKB: (q) => apiClient.get('/support/kb/search', { params: { q } }),
  startChat: (agentId) => apiClient.post('/support/chat/start', { agentId })
};

export default ticketService;
