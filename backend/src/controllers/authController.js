'use strict';

const authService = require('../services/authService');

class AuthController {
    async login(req, res) {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                return res.status(400).json({ error: 'Email and password required' });
            }
            const user = await authService.getUserByEmail(email);
            if (!user) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }
            const isValidPassword = await authService.comparePassword(password, user.password);
            if (!isValidPassword) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }
            const token = authService.generateToken({ id: user.id, email: user.email, role: user.role });
            return res.status(200).json({
                message: 'Login successful',
                token,
                user: { id: user.id, email: user.email, role: user.role },
            });
        } catch (error) {
            return res.status(500).json({ error: 'Internal server error', details: error.message });
        }
    }

    async register(req, res) {
        try {
            const { email, username, password, role } = req.body;
            if (!email || !password) {
                return res.status(400).json({ error: 'Email and password required' });
            }
            const user = await authService.registerUser({ email, username, password, role });
            const token = authService.generateToken({ id: user.id, email: user.email, role: user.role });
            return res.status(201).json({
                message: 'Registration successful',
                token,
                user: { id: user.id, email: user.email, role: user.role },
            });
        } catch (error) {
            const status = error.status || 500;
            return res.status(status).json({ error: error.message || 'Internal server error' });
        }
    }

    async getProfile(req, res) {
        try {
            const user = await authService.getUserById(req.user.id);
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }
            return res.status(200).json({ user });
        } catch (error) {
            return res.status(500).json({ error: 'Internal server error', details: error.message });
        }
    }

    logout(req, res) {
        return res.status(200).json({ message: 'Logout successful' });
    }

    async refreshToken(req, res) {
        try {
            const { token } = req.body;
            if (!token) {
                return res.status(400).json({ error: 'Token required' });
            }
            const decoded = authService.verifyToken(token);
            const user = await authService.getUserById(decoded.id);
            if (!user) {
                return res.status(401).json({ error: 'User not found' });
            }
            const newToken = authService.generateToken({ id: user.id, email: user.email, role: user.role });
            return res.status(200).json({ token: newToken });
        } catch (error) {
            return res.status(401).json({ error: 'Invalid or expired token' });
        }
    }
}

module.exports = new AuthController();