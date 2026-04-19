import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import authService from '../../src/services/authService';

vi.mock('axios', () => {
  const instance = {
    post: vi.fn(),
    get: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  };
  return { default: { create: vi.fn(() => instance), ...instance } };
});

vi.mock('../../src/services/api', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

import api from '../../src/services/api';

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('login calls POST /auth/login with credentials', async () => {
    api.post.mockResolvedValue({ data: { user: { id: 1 }, token: 'tok' } });
    const result = await authService.login('a@b.com', 'pass');
    expect(api.post).toHaveBeenCalledWith('/auth/login', { email: 'a@b.com', password: 'pass' });
    expect(result).toHaveProperty('token');
  });

  it('register calls POST /auth/register', async () => {
    api.post.mockResolvedValue({ data: { user: { id: 2 } } });
    await authService.register('Alice', 'alice@test.com', 'pass123');
    expect(api.post).toHaveBeenCalledWith('/auth/register', {
      name: 'Alice',
      email: 'alice@test.com',
      password: 'pass123',
    });
  });

  it('getProfile calls GET /auth/profile', async () => {
    api.get.mockResolvedValue({ data: { user: { id: 1 } } });
    await authService.getProfile();
    expect(api.get).toHaveBeenCalledWith('/auth/profile');
  });

  it('logout calls POST /auth/logout', async () => {
    api.post.mockResolvedValue({ data: {} });
    await authService.logout();
    expect(api.post).toHaveBeenCalledWith('/auth/logout');
  });

  it('refreshToken calls POST /auth/refresh', async () => {
    api.post.mockResolvedValue({ data: { token: 'new-token' } });
    await authService.refreshToken('old-token');
    expect(api.post).toHaveBeenCalledWith('/auth/refresh', { token: 'old-token' });
  });
});
