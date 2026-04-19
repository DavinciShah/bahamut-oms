import api from './integrationService';

export const syncInvoices = (data) => api.post('/api/sync/invoices', data);
export const syncPayments = (data) => api.post('/api/sync/payments', data);
export const syncExpenses = (data) => api.post('/api/sync/expenses', data);
export const syncCustomers = (data) => api.post('/api/sync/customers', data);
export const syncProducts = (data) => api.post('/api/sync/products', data);
export const getSyncStatus = () => api.get('/api/sync/status');
export const getSyncLogs = (params) => api.get('/api/sync/logs', { params });
export const retrySyncById = (id) => api.post(`/api/sync/retry/${id}`);
