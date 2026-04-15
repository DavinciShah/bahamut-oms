import api from './api';
import { buildQueryString } from '../utils/helpers';

export const productsService = {
  getProducts: (params) =>
    api.get(`/products${buildQueryString(params)}`).then((r) => r.data),

  getProductById: (id) => api.get(`/products/${id}`).then((r) => r.data),

  createProduct: (data) => api.post('/products', data).then((r) => r.data),

  updateProduct: (id, data) =>
    api.put(`/products/${id}`, data).then((r) => r.data),

  deleteProduct: (id) => api.delete(`/products/${id}`).then((r) => r.data),

  updateStock: (id, quantity) =>
    api.put(`/products/${id}/stock`, { quantity }).then((r) => r.data),

  getStockInfo: (id) =>
    api.get(`/products/${id}/stock`).then((r) => r.data),
};

export default productsService;
