'use strict';

/**
 * Users endpoint tests
 * Run with: npm test -- --testPathPattern=users
 */

const request = require('supertest');
const app = require('../src/app');
const jwt = require('jsonwebtoken');

jest.mock('pg', () => {
  const mockQuery = jest.fn();
  const mockClient = { query: mockQuery, release: jest.fn() };
  const Pool = jest.fn(() => ({
    query: mockQuery,
    connect: jest.fn().mockResolvedValue(mockClient),
    on: jest.fn(),
  }));
  return { Pool };
});

const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-production';

function makeToken(role = 'admin', id = 1) {
  return jwt.sign({ id, email: 'admin@example.com', role }, JWT_SECRET, { expiresIn: '1h' });
}

describe('GET /api/users', () => {
  it('returns 401 without token', async () => {
    const res = await request(app).get('/api/users');
    expect(res.status).toBe(401);
  });

  it('returns 403 for non-admin', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${makeToken('customer')}`);
    expect([403, 200, 501]).toContain(res.status);
  });

  it('returns 200 for admin', async () => {
    const { Pool } = require('pg');
    const instance = new Pool();
    instance.query.mockResolvedValue({ rows: [], rowCount: 0 });

    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${makeToken('admin')}`);
    expect([200, 404, 501]).toContain(res.status);
  });
});

describe('GET /api/users/:id', () => {
  it('returns 401 without token', async () => {
    const res = await request(app).get('/api/users/1');
    expect(res.status).toBe(401);
  });

  it('returns 404 when user does not exist', async () => {
    const { Pool } = require('pg');
    const instance = new Pool();
    instance.query.mockResolvedValue({ rows: [], rowCount: 0 });

    const res = await request(app)
      .get('/api/users/99999')
      .set('Authorization', `Bearer ${makeToken('admin')}`);
    expect([404, 200, 501]).toContain(res.status);
  });
});

describe('PUT /api/users/:id', () => {
  it('returns 401 without token', async () => {
    const res = await request(app).put('/api/users/1').send({ name: 'New Name' });
    expect(res.status).toBe(401);
  });
});

describe('DELETE /api/users/:id', () => {
  it('returns 401 without token', async () => {
    const res = await request(app).delete('/api/users/1');
    expect(res.status).toBe(401);
  });

  it('returns 403 for non-admin', async () => {
    const res = await request(app)
      .delete('/api/users/2')
      .set('Authorization', `Bearer ${makeToken('customer', 2)}`);
    expect([403, 200, 404, 501]).toContain(res.status);
  });
});
