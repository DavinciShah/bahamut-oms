const request = require('supertest');
const app = require('../src/app');

jest.mock('../src/config/database', () => ({
  pool: {
    connect: jest.fn(),
    query: jest.fn()
  },
  query: jest.fn()
}));

const { query } = require('../src/config/database');

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

describe('Auth Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      query
        .mockResolvedValueOnce({ rows: [] }) // findByEmail - no existing user
        .mockResolvedValueOnce({ rows: [{ id: 1, name: 'Test User', email: 'test@example.com', role: 'user', created_at: new Date(), updated_at: new Date() }] }); // create user

      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Test User', email: 'test@example.com', password: 'password123' });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user).toBeDefined();
    });

    it('should return 409 for duplicate email', async () => {
      query.mockResolvedValueOnce({ rows: [{ id: 1, email: 'test@example.com' }] });

      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Test User', email: 'test@example.com', password: 'password123' });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
    });

    it('should return 422 for missing name', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'test@example.com', password: 'password123' });

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
    });

    it('should return 422 for invalid email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Test User', email: 'invalid-email', password: 'password123' });

      expect(res.status).toBe(422);
    });

    it('should return 422 for short password', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Test User', email: 'test@example.com', password: '123' });

      expect(res.status).toBe(422);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login successfully and return tokens', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      const mockUser = { id: 1, name: 'Test', email: 'test@example.com', password: hashedPassword, role: 'user' };

      query
        .mockResolvedValueOnce({ rows: [mockUser] }) // findByEmail
        .mockResolvedValueOnce({ rows: [mockUser] }); // updateRefreshToken

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'password123' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.refreshToken).toBeDefined();
    });

    it('should return 401 for wrong password', async () => {
      const hashedPassword = await bcrypt.hash('correctpassword', 10);
      query.mockResolvedValueOnce({ rows: [{ id: 1, email: 'test@example.com', password: hashedPassword }] });

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'wrongpassword' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should return 401 for user not found', async () => {
      query.mockResolvedValueOnce({ rows: [] });

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'notfound@example.com', password: 'password123' });

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/auth/profile', () => {
    it('should return profile with valid token', async () => {
      const token = jwt.sign({ id: 1, email: 'test@example.com', role: 'user' }, process.env.JWT_SECRET || 'default-jwt-secret-change-in-production');
      query.mockResolvedValueOnce({ rows: [{ id: 1, name: 'Test', email: 'test@example.com', role: 'user', created_at: new Date(), updated_at: new Date() }] });

      const res = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user).toBeDefined();
    });

    it('should return 401 without token', async () => {
      const res = await request(app).get('/api/auth/profile');
      expect(res.status).toBe(401);
    });

    it('should return 403 with invalid token', async () => {
      const res = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer invalidtoken');
      expect(res.status).toBe(403);
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should logout successfully', async () => {
      const token = jwt.sign({ id: 1, email: 'test@example.com', role: 'user' }, process.env.JWT_SECRET || 'default-jwt-secret-change-in-production');
      query.mockResolvedValueOnce({ rows: [{ id: 1 }] });

      const res = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
