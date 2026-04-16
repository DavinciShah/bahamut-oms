import apiClient from './apiClient';

const biService = {
  getDashboard: () => apiClient.get('/bi/dashboard'),
  getFactSales: (params) => apiClient.get('/bi/facts/sales', { params }),
  runETL: (data) => apiClient.post('/bi/etl/run', data),
  getRevenuePredictions: (months) => apiClient.get('/bi/predictions/revenue', { params: { months } }),
  getChurnPredictions: () => apiClient.get('/bi/predictions/churn'),
  getAnomalies: () => apiClient.get('/bi/anomalies')
};

export default biService;
