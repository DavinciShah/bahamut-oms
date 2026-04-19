import api from './api';
import { buildQueryString } from '../utils/helpers';

export const ordersService = {
  getOrders: (params) =>
    api.get(`/orders${buildQueryString(params)}`).then((r) => r.data),

  createOrder: (data) => api.post('/orders', data).then((r) => r.data),

  getOrderById: (id) => api.get(`/orders/${id}`).then((r) => r.data),

  updateOrderStatus: (id, status) =>
    api.put(`/orders/${id}`, { status }).then((r) => r.data),

  cancelOrder: (id) => api.delete(`/orders/${id}`).then((r) => r.data),

  getOrderItems: (id) =>
    api.get(`/orders/${id}/items`).then((r) => r.data),
};

export default ordersService;
