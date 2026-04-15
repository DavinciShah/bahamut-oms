import api from './api';
import { buildQueryString } from '../utils/helpers';

export const usersService = {
  getUsers: (params) =>
    api.get(`/users${buildQueryString(params)}`).then((r) => r.data),

  getUserById: (id) => api.get(`/users/${id}`).then((r) => r.data),

  updateUser: (id, data) =>
    api.put(`/users/${id}`, data).then((r) => r.data),

  deleteUser: (id) => api.delete(`/users/${id}`).then((r) => r.data),

  searchUsers: (query) =>
    api.get(`/users/search?q=${encodeURIComponent(query)}`).then((r) => r.data),
};

export default usersService;
