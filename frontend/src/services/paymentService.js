import apiClient from './apiClient';

const paymentService = {
  getSubscription: () => apiClient.get('/payments/subscription'),
  getInvoices: () => apiClient.get('/payments/invoices'),
  getInvoice: (id) => apiClient.get(`/payments/invoices/${id}`),
  createPaymentIntent: (data) => apiClient.post('/payments/intent', data),
  getPaymentHistory: () => apiClient.get('/payments/history'),
  cancelSubscription: () => apiClient.post('/payments/subscription/cancel'),
  updateSubscription: (planId) => apiClient.put('/payments/subscription', { planId }),
  getPlans: () => apiClient.get('/payments/plans')
};

export default paymentService;
