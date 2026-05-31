const DEFAULT_AUTH_STORAGE_KEY = 'devibe_oms_auth';
const DEFAULT_REQUEST_TIMEOUT_MS = 30000;

const getWindowRuntimeConfig = () => {
  if (typeof window === 'undefined' || typeof window.__BAHAMUT_RUNTIME_CONFIG__ !== 'object') {
    return {};
  }

  return window.__BAHAMUT_RUNTIME_CONFIG__ || {};
};

const getWindowOrigin = () => {
  if (typeof window === 'undefined' || !window.location?.origin) {
    return 'http://localhost';
  }

  return window.location.origin;
};

const normalizeTimeout = (value) => {
  const parsedValue = Number.parseInt(value, 10);
  if (Number.isFinite(parsedValue) && parsedValue > 0) {
    return parsedValue;
  }

  return DEFAULT_REQUEST_TIMEOUT_MS;
};

const runtimeConfig = getWindowRuntimeConfig();

export const HAS_EXPLICIT_SOCKET_URL = Boolean(runtimeConfig.socketBaseUrl || import.meta.env.VITE_SOCKET_URL);

export const RUNTIME_CONFIG = Object.freeze({
  apiBaseUrl: runtimeConfig.apiBaseUrl || import.meta.env.VITE_API_URL || '/api',
  socketBaseUrl: runtimeConfig.socketBaseUrl || import.meta.env.VITE_SOCKET_URL || getWindowOrigin(),
  authStorageKey: runtimeConfig.authStorageKey || DEFAULT_AUTH_STORAGE_KEY,
  requestTimeoutMs: normalizeTimeout(runtimeConfig.requestTimeoutMs ?? import.meta.env.VITE_REQUEST_TIMEOUT_MS),
});

export const AUTH_STORAGE_NAMESPACE = RUNTIME_CONFIG.authStorageKey;
export const SOCKET_URL = RUNTIME_CONFIG.socketBaseUrl;
export const REQUEST_TIMEOUT_MS = RUNTIME_CONFIG.requestTimeoutMs;
