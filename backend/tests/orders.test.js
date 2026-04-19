const request = require('supertest');
const app = require('../src/app');
const jwt = require('jsonwebtoken');

jest.mock('../src/config/database', () => ({
  pool: {
    connect: jest.fn().mockResolvedValue({
      query: jest.fn(),
      release: jest.fn()
    }),
    query: jest.fn()
  },
  query: jest.fn()
}));

const { query, pool } = require('../src/config/database');

const JWT_SECRET = process.env.JWT_SECRET || 'default-jwt-secret-change-in-production';

const userToken = jwt.sign({ id: 1, email: 'user@example.com', role: 'user' }, JWT_SECRET);
const adminToken = jwt.sign({ id: 2, email: 'admin@example.com', role: 'admin' }, JWT_SECRET);

describe('Orders Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/orders', () => {
    it('should return orders for authenticated user', async () => {
      query
        .mockResolvedValueOnce({ rows: [{ id: 1, user_id: 1, status: 'pending', total_amount: 100 }] })
        .mockResolvedValueOnce({ rows: [{ count: '1' }] });

      const res = await request(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 401 without token', async () => {
      const res = await request(app).get('/api/orders');
      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/orders', () => {
    it('should create an order with valid items', async () => {
      const mockClient = {
        query: jest.fn()
          .mockResolvedValueOnce({}) // BEGIN
          .mockResolvedValueOnce({ rows: [{ id: 1, user_id: 1, status: 'pending', total_amount: 200, shipping_address: '123 Main St', notes: null, created_at: new Date(), updated_at: new Date() }] }) // INSERT order
          .mockResolvedValueOnce({}) // INSERT order_item
          .mockResolvedValueOnce({}) // UPDATE product stock
          .mockResolvedValueOnce({}), // COMMIT
        release: jest.fn()
      };
      pool.connect.mockResolvedValue(mockClient);

      query
        .mockResolvedValueOnce({ rows: [{ id: 1, name: 'Product A', price: 100, stock: 10 }] }) // findById product
        .mockResolvedValueOnce({ rows: [{ id: 1, order_id: 1, product_id: 1, quantity: 2, unit_price: 100 }] }); // findByOrderId

      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ items: [{ productId: 1, quantity: 2 }], shippingAddress: '123 Main St' });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('should return 422 for missing items', async () => {
      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ shippingAddress: '123 Main St' });

      expect(res.status).toBe(422);
    });
  });

  describe('GET /api/orders/:id', () => {
    it('should return order by id', async () => {
      query
        .mockResolvedValueOnce({ rows: [{ id: 1, user_id: 1, status: 'pending', total_amount: 100 }] }) // findById
        .mockResolvedValueOnce({ rows: [] }); // findByOrderId items

      const res = await request(app)
        .get('/api/orders/1')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 404 for non-existent order', async () => {
      query.mockResolvedValueOnce({ rows: [] });

      const res = await request(app)
        .get('/api/orders/999')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/orders/:id', () => {
    it('should update order status as admin', async () => {
      query
        .mockResolvedValueOnce({ rows: [{ id: 1, user_id: 1, status: 'pending' }] }) // findById
        .mockResolvedValueOnce({ rows: [{ id: 1, status: 'processing' }] }); // update

      const res = await request(app)
        .put('/api/orders/1')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'processing' });

      expect(res.status).toBe(200);
    });

    it('should return 403 for non-admin', async () => {
      query.mockResolvedValueOnce({ rows: [{ id: 1, user_id: 1, status: 'pending' }] });

      const res = await request(app)
        .put('/api/orders/1')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ status: 'processing' });

      expect(res.status).toBe(403);
    });
  });

  describe('DELETE /api/orders/:id', () => {
    it('should cancel a pending order', async () => {
      query
        .mockResolvedValueOnce({ rows: [{ id: 1, user_id: 1, status: 'pending' }] }) // findById
        .mockResolvedValueOnce({ rows: [{ id: 1, status: 'cancelled' }] }); // update

      const res = await request(app)
        .delete('/api/orders/1')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
    });
  });
});
