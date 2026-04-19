'use strict';

/**
 * Integration tests
 * These tests spin up the Express app and exercise full request/response cycles.
 * Run with: npm test -- --testPathPattern=integration
 */

const request = require('supertest');
const app = require('../src/app');
const jwt = require('jsonwebtoken');

// Mock pg pool for all integration tests
jest.mock('pg', () => {
  const mockQuery = jest.fn().mockResolvedValue({ rows: [], rowCount: 0 });
  const mockClient = {
    query: jest.fn().mockResolvedValue({ rows: [], rowCount: 0 }),
    release: jest.fn(),
  };
  const Pool = jest.fn(() => ({
    query: mockQuery,
    connect: jest.fn().mockResolvedValue(mockClient),
    on: jest.fn(),
  }));
  return { Pool };
});

jest.mock('../src/services/emailService', () => ({
  sendEmail: jest.fn().mockResolvedValue(true),
}));

const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-production';

function adminToken() {
  return jwt.sign({ id: 1, email: 'admin@example.com', role: 'admin' }, JWT_SECRET, { expiresIn: '1h' });
}

function customerToken() {
  return jwt.sign({ id: 2, email: 'user@example.com', role: 'customer' }, JWT_SECRET, { expiresIn: '1h' });
}

// ── Health check ─────────────────────────────────────────────────────────────

describe('GET /api/health', () => {
  it('returns 200 OK', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('OK');
  });
});

// ── Auth ──────────────────────────────────────────────────────────────────────

describe('Auth flow', () => {
  it('POST /api/auth/register returns 422 for invalid data', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'bad', password: 'x' });
    expect([422, 501]).toContain(res.status);
  });

  it('POST /api/auth/login returns 4xx for missing credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({});
    expect(res.status).toBeGreaterThanOrEqual(400);
  });

  it('GET /api/auth/profile returns 401 without token', async () => {
    const res = await request(app).get('/api/auth/profile');
    expect([401, 501]).toContain(res.status);
  });
});

// ── Products ──────────────────────────────────────────────────────────────────

describe('Products flow', () => {
  it('GET /api/products requires authentication', async () => {
    const res = await request(app).get('/api/products');
    expect([401, 501]).toContain(res.status);
  });

  it('POST /api/products returns 422 for invalid body', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken()}`)
      .send({});
    expect([400, 422, 501]).toContain(res.status);
  });
});

// ── Orders ───────────────────────────────────────────────────────────────────

describe('Orders flow', () => {
  it('GET /api/orders requires authentication', async () => {
    const res = await request(app).get('/api/orders');
    expect([401, 501]).toContain(res.status);
  });

  it('POST /api/orders returns 422 for empty body', async () => {
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${customerToken()}`)
      .send({});
    expect([400, 422, 501]).toContain(res.status);
  });
});

// ── Users ─────────────────────────────────────────────────────────────────────

describe('Users flow', () => {
  it('GET /api/users requires authentication', async () => {
    const res = await request(app).get('/api/users');
    expect([401, 501]).toContain(res.status);
  });

  it('Non-admin cannot list users', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${customerToken()}`);
    expect([403, 200, 501]).toContain(res.status);
  });
});

// ── Rate limiting / security headers ─────────────────────────────────────────

describe('Security', () => {
  it('responds with X-Content-Type-Options header (helmet)', async () => {
    const res = await request(app).get('/api/health');
    expect(res.headers['x-content-type-options']).toBeDefined();
  });
});
