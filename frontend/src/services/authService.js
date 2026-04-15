import api from './api';

export const authService = {
  login: (email, password) =>
    api.post('/auth/login', { email, password }).then((r) => r.data),

  register: (name, email, password) =>
    api.post('/auth/register', { name, email, password }).then((r) => r.data),

  logout: () => api.post('/auth/logout').then((r) => r.data),

  getProfile: () => api.get('/auth/profile').then((r) => r.data),

  refreshToken: (token) =>
    api.post('/auth/refresh', { token }).then((r) => r.data),
};

export default authService;
