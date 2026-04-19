import api from './api';
import { buildQueryString } from '../utils/helpers';

export const adminService = {
  getStats: () => api.get('/admin/stats').then((r) => r.data),

  getOrdersReport: (params) =>
    api.get(`/admin/reports/orders${buildQueryString(params)}`).then((r) => r.data),

  getInventoryReport: () =>
    api.get('/admin/reports/inventory').then((r) => r.data),

  getRevenueReport: (params) =>
    api.get(`/admin/reports/revenue${buildQueryString(params)}`).then((r) => r.data),

  getUserActivity: () =>
    api.get('/admin/users/activity').then((r) => r.data),
};

export default adminService;
