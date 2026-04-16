import apiClient from './apiClient';

const shippingService = {
  getRates: (data) => apiClient.post('/shipping/rates', data),
  createShipment: (data) => apiClient.post('/shipping/shipments', data),
  getShipments: (params) => apiClient.get('/shipping/shipments', { params }),
  getShipment: (id) => apiClient.get(`/shipping/shipments/${id}`),
  cancelShipment: (id) => apiClient.delete(`/shipping/shipments/${id}`),
  getTracking: (trackingNumber, carrier) => apiClient.get(`/shipping/track/${trackingNumber}`, { params: { carrier } })
};

export default shippingService;
