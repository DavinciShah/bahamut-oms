'use strict';

/**
 * Auth API integration tests.
 *
 * Uses Jest + Supertest. The database pool is mocked so no real
 * PostgreSQL instance is required.
 */

jest.mock('../src/config/database', () => {
  // Minimal pool mock – each test overrides query as needed.
  const pool = { query: jest.fn() };
  return pool;
});

const request = require('supertest');
const app     = require('../src/app');
const pool    = require('../src/config/database');
const bcrypt  = require('bcrypt');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const HASH = bcrypt.hashSync('Password1', 10);

const MOCK_USER = {
  id:         1,
  email:      'test@example.com',
  username:   'testuser',
  password:   HASH,
  role:       'user',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const SAFE_USER = (({ password: _pw, ...u }) => u)(MOCK_USER);

// ---------------------------------------------------------------------------
// POST /api/auth/register
// ---------------------------------------------------------------------------

describe('POST /api/auth/register', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns 201 and user data on success', async () => {
    // findByEmail → no existing user
    pool.query
      .mockResolvedValueOnce({ rows: [] })        // findByEmail
      .mockResolvedValueOnce({ rows: [SAFE_USER] }); // create

    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@example.com', username: 'testuser', password: 'Password1' });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user).toMatchObject({ email: 'test@example.com' });
  });

  it('returns 409 when email is already registered', async () => {
    pool.query.mockResolvedValueOnce({ rows: [MOCK_USER] }); // findByEmail

    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@example.com', username: 'testuser', password: 'Password1' });

    expect(res.status).toBe(409);
  });

  it('returns 400 for invalid email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'not-an-email', username: 'testuser', password: 'Password1' });

    expect(res.status).toBe(400);
  });

  it('returns 400 for weak password', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@example.com', username: 'testuser', password: 'short' });

    expect(res.status).toBe(400);
  });
});

// ---------------------------------------------------------------------------
// POST /api/auth/login
// ---------------------------------------------------------------------------

describe('POST /api/auth/login', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns 200 and a JWT token on success', async () => {
    pool.query.mockResolvedValueOnce({ rows: [MOCK_USER] }); // findByEmail

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'Password1' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user).not.toHaveProperty('password');
  });

  it('returns 401 for wrong password', async () => {
    pool.query.mockResolvedValueOnce({ rows: [MOCK_USER] }); // findByEmail

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'WrongPass9' });

    expect(res.status).toBe(401);
  });

  it('returns 401 for unknown email', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] }); // findByEmail

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@example.com', password: 'Password1' });

    expect(res.status).toBe(401);
  });
});

// ---------------------------------------------------------------------------
// GET /api/auth/profile
// ---------------------------------------------------------------------------

describe('GET /api/auth/profile', () => {
  let token;

  beforeAll(async () => {
    // Mint a real token the same way the service does.
    const jwt = require('jsonwebtoken');
    const { jwtSecret } = require('../src/config/auth');
    token = jwt.sign(
      { id: SAFE_USER.id, email: SAFE_USER.email, role: SAFE_USER.role },
      jwtSecret,
      { expiresIn: '1h' }
    );
  });

  beforeEach(() => jest.clearAllMocks());

  it('returns 200 and user profile when authenticated', async () => {
    pool.query.mockResolvedValueOnce({ rows: [SAFE_USER] }); // findById

    const res = await request(app)
      .get('/api/auth/profile')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.user).toMatchObject({ email: 'test@example.com' });
  });

  it('returns 401 when no token is provided', async () => {
    const res = await request(app).get('/api/auth/profile');
    expect(res.status).toBe(401);
  });
});
