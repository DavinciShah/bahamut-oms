export const APP_NAME = 'De Vibe OMS';

import { RUNTIME_CONFIG } from './runtimeConfig';

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

export const API_URL = normalizeApiUrlForHttps(RUNTIME_CONFIG.apiBaseUrl);
export const REQUEST_TIMEOUT_MS = RUNTIME_CONFIG.requestTimeoutMs;

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
