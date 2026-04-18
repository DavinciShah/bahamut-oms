'use strict';

const request = require('supertest');
const app = require('../src/app');
const authService = require('../src/services/authService');

jest.mock('../src/services/authService');

describe('POST /api/auth/login', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('returns 400 when email is missing', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ password: 'secret' });
        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Email and password required');
    });

    it('returns 400 when password is missing', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'user@example.com' });
        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Email and password required');
    });

    it('returns 401 when user is not found', async () => {
        authService.getUserByEmail.mockResolvedValue(null);
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'unknown@example.com', password: 'secret' });
        expect(res.status).toBe(401);
        expect(res.body.error).toBe('Invalid credentials');
    });

    it('returns 401 when password is incorrect', async () => {
        authService.getUserByEmail.mockResolvedValue({
            id: 1, email: 'user@example.com', password: 'hashed', role: 'user',
        });
        authService.comparePassword.mockResolvedValue(false);
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'user@example.com', password: 'wrongpassword' });
        expect(res.status).toBe(401);
        expect(res.body.error).toBe('Invalid credentials');
    });

    it('returns 200 with token on successful login', async () => {
        authService.getUserByEmail.mockResolvedValue({
            id: 1, email: 'user@example.com', password: 'hashed', role: 'user',
        });
        authService.comparePassword.mockResolvedValue(true);
        authService.generateToken.mockReturnValue('mock.jwt.token');

        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'user@example.com', password: 'password123' });
        expect(res.status).toBe(200);
        expect(res.body.message).toBe('Login successful');
        expect(res.body.token).toBe('mock.jwt.token');
        expect(res.body.user).toMatchObject({ id: 1, email: 'user@example.com', role: 'user' });
    });

    it('returns 500 on unexpected error', async () => {
        authService.getUserByEmail.mockRejectedValue(new Error('DB error'));
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'user@example.com', password: 'password123' });
        expect(res.status).toBe(500);
        expect(res.body.error).toBe('Internal server error');
    });
});

describe('POST /api/auth/register', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('returns 400 when email is missing', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({ password: 'secret' });
        expect(res.status).toBe(400);
    });

    it('returns 201 with token on successful registration', async () => {
        authService.registerUser.mockResolvedValue({
            id: 2, email: 'new@example.com', role: 'user',
        });
        authService.generateToken.mockReturnValue('new.jwt.token');

        const res = await request(app)
            .post('/api/auth/register')
            .send({ email: 'new@example.com', password: 'password123' });
        expect(res.status).toBe(201);
        expect(res.body.message).toBe('Registration successful');
        expect(res.body.token).toBe('new.jwt.token');
    });

    it('returns 409 when email already in use', async () => {
        const err = new Error('Email already in use');
        err.status = 409;
        authService.registerUser.mockRejectedValue(err);

        const res = await request(app)
            .post('/api/auth/register')
            .send({ email: 'existing@example.com', password: 'password123' });
        expect(res.status).toBe(409);
        expect(res.body.error).toBe('Email already in use');
    });
});
