import axios from 'axios';
import { getAuthToken } from '../utils/authStorage';
import { API_URL, REQUEST_TIMEOUT_MS } from '../utils/constants';

const API_BASE = import.meta.env.VITE_API_BASE_URL || API_URL;

const api = axios.create({ baseURL: API_BASE, timeout: REQUEST_TIMEOUT_MS });

api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const getIntegrations = () => api.get('/api/integrations');
export const connectIntegration = (data) => api.post('/api/integrations/connect', data);
export const getIntegration = (id) => api.get(`/api/integrations/${id}`);
export const updateIntegration = (id, data) => api.put(`/api/integrations/${id}`, data);
export const deleteIntegration = (id) => api.delete(`/api/integrations/${id}`);
export const getIntegrationStatus = (id) => api.get(`/api/integrations/${id}/status`);
export const testIntegration = (id) => api.post(`/api/integrations/${id}/test`);

export default api;
