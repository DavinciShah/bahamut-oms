import apiClient from './apiClient';

const warehouseService = {
  getAll: () => apiClient.get('/warehouses'),
  getById: (id) => apiClient.get(`/warehouses/${id}`),
  create: (data) => apiClient.post('/warehouses', data),
  update: (id, data) => apiClient.put(`/warehouses/${id}`, data),
  delete: (id) => apiClient.delete(`/warehouses/${id}`),
  getInventory: (id) => apiClient.get(`/warehouses/${id}/inventory`)
};

export default warehouseService;
