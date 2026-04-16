import apiClient from './apiClient';

const notificationService = {
  getAll: () => apiClient.get('/notifications'),
  getUnread: () => apiClient.get('/notifications?read=false'),
  markRead: (id) => apiClient.put(`/notifications/${id}/read`),
  markAllRead: () => apiClient.put('/notifications/read-all'),
  delete: (id) => apiClient.delete(`/notifications/${id}`),
  getCount: () => apiClient.get('/notifications/count')
};

export default notificationService;
