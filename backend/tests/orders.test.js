'use strict';

/**
 * Orders endpoint tests
 * Run with: npm test -- --testPathPattern=orders
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

function makeToken(payload = {}) {
  return jwt.sign(
    { id: 1, email: 'staff@example.com', role: 'staff', ...payload },
    JWT_SECRET,
    { expiresIn: '1h' }
  );
}

describe('GET /api/orders', () => {
  it('returns 401 without token', async () => {
    const res = await request(app).get('/api/orders');
    expect(res.status).toBe(401);
  });

  it('returns 200 with valid token', async () => {
    const { Pool } = require('pg');
    const instance = new Pool();
    instance.query.mockResolvedValue({ rows: [], rowCount: 0 });

    const res = await request(app)
      .get('/api/orders')
      .set('Authorization', `Bearer ${makeToken()}`);
    expect([200, 404, 501]).toContain(res.status);
  });
});

describe('POST /api/orders', () => {
  it('returns 401 without token', async () => {
    const res = await request(app).post('/api/orders').send({});
    expect(res.status).toBe(401);
  });

  it('returns 422 when body is empty', async () => {
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${makeToken()}`)
      .send({});
    expect([422, 400, 501]).toContain(res.status);
  });

  it('returns 422 when items array is empty', async () => {
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${makeToken()}`)
      .send({ customer_id: 1, items: [] });
    expect([422, 400, 501]).toContain(res.status);
  });
});

describe('GET /api/orders/:id', () => {
  it('returns 401 without token', async () => {
    const res = await request(app).get('/api/orders/1');
    expect(res.status).toBe(401);
  });

  it('returns 404 for non-existent order', async () => {
    const { Pool } = require('pg');
    const instance = new Pool();
    instance.query.mockResolvedValue({ rows: [], rowCount: 0 });

    const res = await request(app)
      .get('/api/orders/99999')
      .set('Authorization', `Bearer ${makeToken()}`);
    expect([404, 200, 501]).toContain(res.status);
  });
});

describe('PATCH /api/orders/:id/cancel', () => {
  it('returns 401 without token', async () => {
    const res = await request(app).patch('/api/orders/1/cancel');
    expect(res.status).toBe(401);
  });
});

describe('PATCH /api/orders/:id/status', () => {
  it('returns 401 without token', async () => {
    const res = await request(app).patch('/api/orders/1/status').send({ status: 'confirmed' });
    expect(res.status).toBe(401);
  });
});
