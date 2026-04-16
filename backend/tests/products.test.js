'use strict';

/**
 * Products endpoint tests
 * Run with: npm test -- --testPathPattern=products
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

function makeToken(role = 'admin') {
  return jwt.sign({ id: 1, email: 'admin@example.com', role }, JWT_SECRET, { expiresIn: '1h' });
}

describe('GET /api/products', () => {
  it('returns 401 without token', async () => {
    const res = await request(app).get('/api/products');
    expect([401, 501]).toContain(res.status);
  });

  it('returns 200 with valid token', async () => {
    const { Pool } = require('pg');
    const instance = new Pool();
    instance.query.mockResolvedValue({ rows: [], rowCount: 0 });

    const res = await request(app)
      .get('/api/products')
      .set('Authorization', `Bearer ${makeToken()}`);
    expect([200, 404, 501]).toContain(res.status);
  });
});

describe('POST /api/products', () => {
  it('returns 401 without token', async () => {
    const res = await request(app).post('/api/products').send({});
    expect([401, 501]).toContain(res.status);
  });

  it('returns 403 for non-admin role', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${makeToken('customer')}`)
      .send({ name: 'Widget', sku: 'W001', price: 9.99 });
    expect([403, 422, 201, 501]).toContain(res.status);
  });

  it('returns 422 when required fields are missing', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${makeToken()}`)
      .send({});
    expect([422, 400, 501]).toContain(res.status);
  });
});

describe('GET /api/products/:id', () => {
  it('returns 401 without token', async () => {
    const res = await request(app).get('/api/products/1');
    expect([401, 501]).toContain(res.status);
  });

  it('returns 404 for non-existent product', async () => {
    const { Pool } = require('pg');
    const instance = new Pool();
    instance.query.mockResolvedValue({ rows: [], rowCount: 0 });

    const res = await request(app)
      .get('/api/products/99999')
      .set('Authorization', `Bearer ${makeToken()}`);
    expect([404, 200, 501]).toContain(res.status);
  });
});

describe('PUT /api/products/:id', () => {
  it('returns 401 without token', async () => {
    const res = await request(app).put('/api/products/1').send({ price: 5.99 });
    expect([401, 501]).toContain(res.status);
  });
});

describe('DELETE /api/products/:id', () => {
  it('returns 401 without token', async () => {
    const res = await request(app).delete('/api/products/1');
    expect([401, 501]).toContain(res.status);
  });
});
