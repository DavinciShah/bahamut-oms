'use strict';

/**
 * Users endpoint tests
 * Run with: npm test -- --testPathPattern=users
 */

const request = require('supertest');
const app = require('../src/app');
const jwt = require('jsonwebtoken');

jest.mock('../src/config/database', () => ({
  pool: { connect: jest.fn(), query: jest.fn() },
  query: jest.fn()
}));

const { query } = require('../src/config/database');
const JWT_SECRET = process.env.JWT_SECRET || 'default-jwt-secret-change-in-production';

const adminToken = jwt.sign({ id: 1, email: 'admin@example.com', role: 'admin' }, JWT_SECRET);
const userToken = jwt.sign({ id: 2, email: 'user@example.com', role: 'user' }, JWT_SECRET);

const mockUser = { id: 2, name: 'Test User', email: 'user@example.com', role: 'user', created_at: new Date(), updated_at: new Date() };

describe('Users Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/users', () => {
    it('should return users for admin', async () => {
      query
        .mockResolvedValueOnce({ rows: [mockUser] })
        .mockResolvedValueOnce({ rows: [{ count: '1' }] });

      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 403 for non-admin', async () => {
      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(403);
    });

    it('should return 401 without token', async () => {
      const res = await request(app).get('/api/users');
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/users/:id', () => {
    it('should return user by id', async () => {
      query.mockResolvedValueOnce({ rows: [mockUser] });

      const res = await request(app)
        .get('/api/users/2')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 404 for non-existent user', async () => {
      query.mockResolvedValueOnce({ rows: [] });

      const res = await request(app)
        .get('/api/users/999')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/users/:id', () => {
    it('should update user', async () => {
      query
        .mockResolvedValueOnce({ rows: [mockUser] }) // findById
        .mockResolvedValueOnce({ rows: [{ ...mockUser, name: 'Updated Name' }] }); // update (no email change, so no findByEmail call)

      const res = await request(app)
        .put('/api/users/2')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ name: 'Updated Name' });

      expect(res.status).toBe(200);
    });
  });

  describe('DELETE /api/users/:id', () => {
    it('should delete user as admin', async () => {
      query.mockResolvedValueOnce({ rows: [mockUser] });

      const res = await request(app)
        .delete('/api/users/2')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
    });

    it('should return 403 for non-admin', async () => {
      const res = await request(app)
        .delete('/api/users/2')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(403);
    });
  });

  describe('GET /api/users/search', () => {
    it('should search users as admin', async () => {
      query.mockResolvedValueOnce({ rows: [mockUser] });

      const res = await request(app)
        .get('/api/users/search?q=test')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 403 for non-admin', async () => {
      const res = await request(app)
        .get('/api/users/search?q=test')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(403);
    });
  });
});
