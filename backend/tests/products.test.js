'use strict';

/**
 * Products endpoint tests
 * Run with: npm test -- --testPathPattern=products
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

const mockProduct = { id: 1, name: 'Test Product', description: 'A product', price: 29.99, stock: 100, category: 'Electronics', sku: 'TEST-001', created_at: new Date(), updated_at: new Date() };

describe('Products Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/products', () => {
    it('should return products publicly', async () => {
      query
        .mockResolvedValueOnce({ rows: [mockProduct] })
        .mockResolvedValueOnce({ rows: [{ count: '1' }] });

      const res = await request(app).get('/api/products');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.products).toHaveLength(1);
    });
  });

  describe('POST /api/products', () => {
    it('should create a product as admin', async () => {
      query
        .mockResolvedValueOnce({ rows: [] }) // findBySku - no existing
        .mockResolvedValueOnce({ rows: [mockProduct] }); // create

      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Test Product', price: 29.99, stock: 100, sku: 'TEST-001' });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('should return 403 for non-admin', async () => {
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ name: 'Test Product', price: 29.99 });

      expect(res.status).toBe(403);
    });

    it('should return 422 for invalid price', async () => {
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Test Product', price: -10 });

      expect(res.status).toBe(422);
    });
  });

  describe('GET /api/products/:id', () => {
    it('should return product by id', async () => {
      query.mockResolvedValueOnce({ rows: [mockProduct] });

      const res = await request(app).get('/api/products/1');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 404 for non-existent product', async () => {
      query.mockResolvedValueOnce({ rows: [] });

      const res = await request(app).get('/api/products/999');

      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/products/:id', () => {
    it('should update product as admin', async () => {
      query
        .mockResolvedValueOnce({ rows: [mockProduct] }) // findById
        .mockResolvedValueOnce({ rows: [{ ...mockProduct, name: 'Updated Product' }] }); // update

      const res = await request(app)
        .put('/api/products/1')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Updated Product' });

      expect(res.status).toBe(200);
    });

    it('should return 403 for non-admin', async () => {
      const res = await request(app)
        .put('/api/products/1')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ name: 'Updated Product' });

      expect(res.status).toBe(403);
    });
  });

  describe('DELETE /api/products/:id', () => {
    it('should delete product as admin', async () => {
      query.mockResolvedValueOnce({ rows: [mockProduct] });

      const res = await request(app)
        .delete('/api/products/1')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
    });

    it('should return 403 for non-admin', async () => {
      const res = await request(app)
        .delete('/api/products/1')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(403);
    });
  });
});
