import api from './integrationService';

export const registerWebhook = (data) => api.post('/api/webhooks/register', data);
export const listWebhooks = () => api.get('/api/webhooks');
export const deleteWebhook = (id) => api.delete(`/api/webhooks/${id}`);
export const testWebhook = (id) => api.post(`/api/webhooks/test/${id}`);
