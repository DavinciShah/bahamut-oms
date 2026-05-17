import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('authStorage', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.resetModules();
  });

  it('migrates legacy auth keys into the runtime-config namespace', async () => {
    vi.doMock('../../src/utils/runtimeConfig', () => ({
      AUTH_STORAGE_NAMESPACE: 'android_auth',
    }));

    localStorage.setItem('token', 'legacy-token');
    localStorage.setItem('user', JSON.stringify({ id: 1 }));

    const { AUTH_STORAGE_KEYS, getAuthToken, getStoredUser } = await import('../../src/utils/authStorage');

    expect(getAuthToken()).toBe('legacy-token');
    expect(getStoredUser()).toBe(JSON.stringify({ id: 1 }));
    expect(localStorage.getItem(AUTH_STORAGE_KEYS.token)).toBe('legacy-token');
    expect(localStorage.getItem(AUTH_STORAGE_KEYS.user)).toBe(JSON.stringify({ id: 1 }));
  });

  it('writes and clears the namespaced session keys', async () => {
    vi.doMock('../../src/utils/runtimeConfig', () => ({
      AUTH_STORAGE_NAMESPACE: 'android_auth',
    }));

    const { AUTH_STORAGE_KEYS, clearAuthSession, setAuthSession } = await import('../../src/utils/authStorage');

    setAuthSession('next-token', { id: 7, name: 'Pilot' });

    expect(localStorage.getItem(AUTH_STORAGE_KEYS.token)).toBe('next-token');
    expect(localStorage.getItem(AUTH_STORAGE_KEYS.user)).toBe(JSON.stringify({ id: 7, name: 'Pilot' }));
    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();

    clearAuthSession();

    expect(localStorage.getItem(AUTH_STORAGE_KEYS.token)).toBeNull();
    expect(localStorage.getItem(AUTH_STORAGE_KEYS.user)).toBeNull();
  });
});
