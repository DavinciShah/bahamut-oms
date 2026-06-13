import axios from 'axios';
import { API_URL, REQUEST_TIMEOUT_MS } from '../utils/constants';
import { clearAuthSession, getAuthToken } from '../utils/authStorage';

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: REQUEST_TIMEOUT_MS,
  headers: { 'Content-Type': 'application/json' }
});

apiClient.interceptors.request.use(config => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      clearAuthSession();
      const loginPath = window.desktopApp?.isDesktop ? '#/login' : '/login';
      window.location.href = loginPath;
    }
    return Promise.reject(error);
  }
);

export default apiClient;
