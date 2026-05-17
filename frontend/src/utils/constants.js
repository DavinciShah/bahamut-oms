export const APP_NAME = 'Bahamut OMS';

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '::1']);

const normalizeApiUrlForHttps = (url) => {
  if (!url || url.startsWith('/')) return url;

  try {
    const parsedUrl = new URL(url);
    const isLocalhost = LOCAL_HOSTS.has(parsedUrl.hostname);

    if (window.location.protocol === 'https:' && parsedUrl.protocol === 'http:' && !isLocalhost) {
      parsedUrl.protocol = 'https:';
      return parsedUrl.toString();
    }
  } catch {
    return url;
  }

  return url;
};

export const API_URL = normalizeApiUrlForHttps(import.meta.env.VITE_API_URL || '/api');

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
