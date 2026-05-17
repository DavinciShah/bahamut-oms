import { AUTH_STORAGE_NAMESPACE } from './runtimeConfig';

const LEGACY_TOKEN_KEY = 'token';
const LEGACY_USER_KEY = 'user';

const scopedTokenKey = `${AUTH_STORAGE_NAMESPACE}:token`;
const scopedUserKey = `${AUTH_STORAGE_NAMESPACE}:user`;

const hasLocalStorage = () => typeof window !== 'undefined' && Boolean(window.localStorage);

const migrateLegacyValue = (scopedKey, legacyKey) => {
  if (!hasLocalStorage()) return null;

  const scopedValue = window.localStorage.getItem(scopedKey);
  if (scopedValue !== null) {
    return scopedValue;
  }

  const legacyValue = window.localStorage.getItem(legacyKey);
  if (legacyValue !== null) {
    window.localStorage.setItem(scopedKey, legacyValue);
  }

  return legacyValue;
};

export const getAuthToken = () => migrateLegacyValue(scopedTokenKey, LEGACY_TOKEN_KEY);

export const getStoredUser = () => migrateLegacyValue(scopedUserKey, LEGACY_USER_KEY);

export const setAuthSession = (token, user) => {
  if (!hasLocalStorage()) return;

  if (token) {
    window.localStorage.setItem(scopedTokenKey, token);
  } else {
    window.localStorage.removeItem(scopedTokenKey);
  }

  if (user) {
    window.localStorage.setItem(scopedUserKey, JSON.stringify(user));
  } else {
    window.localStorage.removeItem(scopedUserKey);
  }

  window.localStorage.removeItem(LEGACY_TOKEN_KEY);
  window.localStorage.removeItem(LEGACY_USER_KEY);
};

export const clearAuthSession = () => {
  if (!hasLocalStorage()) return;

  window.localStorage.removeItem(scopedTokenKey);
  window.localStorage.removeItem(scopedUserKey);
  window.localStorage.removeItem(LEGACY_TOKEN_KEY);
  window.localStorage.removeItem(LEGACY_USER_KEY);
};

export const AUTH_STORAGE_KEYS = Object.freeze({
  token: scopedTokenKey,
  user: scopedUserKey,
});
