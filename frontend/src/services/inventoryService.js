import apiClient from './apiClient';

const inventoryService = {
  getLevels: (params) => apiClient.get('/inventory/levels', { params }),
  getLevel: (id) => apiClient.get(`/inventory/levels/${id}`),
  updateLevel: (id, data) => apiClient.put(`/inventory/levels/${id}`, data),
  adjustStock: (data) => apiClient.post('/inventory/adjust', data),
  getLowStock: () => apiClient.get('/inventory/low-stock'),
  getHistory: (productId) => apiClient.get(`/inventory/history/${productId}`),
  transfer: (data) => apiClient.post('/inventory/transfer', data),
  getTransfers: () => apiClient.get('/inventory/transfers')
};

export default inventoryService;
