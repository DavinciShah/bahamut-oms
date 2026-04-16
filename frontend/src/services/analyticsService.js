import apiClient from './apiClient';

const analyticsService = {
  getDashboard: () => apiClient.get('/analytics/dashboard'),
  getOrderAnalytics: (params) => apiClient.get('/analytics/orders', { params }),
  getRevenueAnalytics: (params) => apiClient.get('/analytics/revenue', { params }),
  getProductAnalytics: (params) => apiClient.get('/analytics/products', { params }),
  getReports: () => apiClient.get('/analytics/reports'),
  createReport: (data) => apiClient.post('/analytics/reports', data),
  runReport: (id) => apiClient.get(`/analytics/reports/${id}/run`),
  exportReport: (id, format) => apiClient.get(`/analytics/reports/${id}/export`, { params: { format }, responseType: 'blob' }),
  getForecast: (periods) => apiClient.get('/analytics/forecast', { params: { periods } })
};

export default analyticsService;
