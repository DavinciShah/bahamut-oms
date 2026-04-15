export const APP_NAME = 'Bahamut OMS';
export const API_URL = import.meta.env.VITE_API_URL || '/api';

export const ORDER_STATUSES = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
};

export const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user',
};

export const ITEMS_PER_PAGE = 10;
