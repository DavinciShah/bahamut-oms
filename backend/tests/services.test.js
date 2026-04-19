'use strict';

/**
 * Service layer tests: authService, orderService, otpService
 * Run with: npm test -- --testPathPattern=services
 */

const authService = require('../src/services/authService');
const otpService  = require('../src/services/otpService');

// Mock pg for orderService
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

// ── authService ──────────────────────────────────────────────────────────────

describe('authService.hashPassword / comparePassword', () => {
  it('hashes a password and verifies it correctly', async () => {
    const hash = await authService.hashPassword('SecurePass@99');
    expect(hash).not.toBe('SecurePass@99');
    const match = await authService.comparePassword('SecurePass@99', hash);
    expect(match).toBe(true);
  });

  it('rejects an incorrect password', async () => {
    const hash = await authService.hashPassword('SecurePass@99');
    const match = await authService.comparePassword('WrongPass@99', hash);
    expect(match).toBe(false);
  });
});

describe('authService.generateToken / verifyToken', () => {
  it('generates and verifies an access token', () => {
    const payload = { id: 42, email: 'user@example.com', role: 'customer' };
    const token = authService.generateToken(payload);
    expect(typeof token).toBe('string');
    const decoded = authService.verifyToken(token);
    expect(decoded.id).toBe(42);
    expect(decoded.email).toBe('user@example.com');
  });

  it('throws for an invalid token', () => {
    expect(() => authService.verifyToken('invalid.token.here')).toThrow();
  });
});

describe('authService.generateRefreshToken / verifyRefreshToken', () => {
  it('generates and verifies a refresh token', () => {
    const payload = { id: 7, email: 'u@example.com' };
    const token = authService.generateRefreshToken(payload);
    expect(typeof token).toBe('string');
    const decoded = authService.verifyRefreshToken(token);
    expect(decoded.id).toBe(7);
  });
});

describe('authService.generateSecureToken', () => {
  it('returns a hex string of the expected length', () => {
    const tok = authService.generateSecureToken(32);
    expect(typeof tok).toBe('string');
    expect(tok).toHaveLength(64); // 32 bytes = 64 hex chars
  });

  it('generates unique tokens', () => {
    const a = authService.generateSecureToken();
    const b = authService.generateSecureToken();
    expect(a).not.toBe(b);
  });
});

// ── otpService ───────────────────────────────────────────────────────────────

describe('otpService.generateOTP / verifyOTP', () => {
  it('generates a 6-digit OTP and verifies it', () => {
    const code = otpService.generateOTP('user-123');
    expect(code).toMatch(/^\d{6}$/);
    const result = otpService.verifyOTP('user-123', code);
    expect(result).toBe(true);
  });

  it('rejects a wrong OTP', () => {
    otpService.generateOTP('user-456');
    expect(otpService.verifyOTP('user-456', '000000')).toBe(false);
  });

  it('returns false for an expired OTP (unknown key)', () => {
    expect(otpService.verifyOTP('no-such-user', '123456')).toBe(false);
  });

  it('cannot reuse a verified OTP', () => {
    const code = otpService.generateOTP('user-789');
    otpService.verifyOTP('user-789', code); // first use
    expect(otpService.verifyOTP('user-789', code)).toBe(false);
  });
});

describe('otpService.generateTOTPSecret', () => {
  it('returns a base32 secret and otpauth URL', () => {
    const { secret, otpauthUrl } = otpService.generateTOTPSecret('user-1');
    expect(typeof secret).toBe('string');
    expect(secret.length).toBeGreaterThan(0);
    expect(otpauthUrl).toMatch(/^otpauth:\/\/totp\//);
    expect(otpauthUrl).toContain(secret);
  });
});

describe('otpService.verifyTOTP', () => {
  it('returns false for a mismatched token', () => {
    const { secret } = otpService.generateTOTPSecret('user-2');
    expect(otpService.verifyTOTP(secret, '000000')).toBe(false);
  });

  it('returns false when secret is missing', () => {
    expect(otpService.verifyTOTP(null, '123456')).toBe(false);
  });
});

// ── validators ───────────────────────────────────────────────────────────────

const { validateEmail, validatePassword, validateOrderData, validateProductData } = require('../src/utils/validators');

describe('validators.validateEmail', () => {
  it('accepts valid emails', () => {
    expect(validateEmail('hello@example.com')).toBe(true);
    expect(validateEmail('user+tag@domain.org')).toBe(true);
  });

  it('rejects invalid emails', () => {
    expect(validateEmail('not-an-email')).toBe(false);
    expect(validateEmail('')).toBe(false);
  });
});

describe('validators.validatePassword', () => {
  it('accepts a strong password', () => {
    const { valid } = validatePassword('StrongPass@99');
    expect(valid).toBe(true);
  });

  it('rejects a short password', () => {
    const { valid, errors } = validatePassword('Ab1!');
    expect(valid).toBe(false);
    expect(errors.length).toBeGreaterThan(0);
  });
});

describe('validators.validateOrderData', () => {
  it('passes with valid data', () => {
    const { valid } = validateOrderData({
      customer_id: 1,
      items: [{ product_id: 1, quantity: 2 }],
    });
    expect(valid).toBe(true);
  });

  it('fails when items is empty', () => {
    const { valid } = validateOrderData({ customer_id: 1, items: [] });
    expect(valid).toBe(false);
  });
});

describe('validators.validateProductData', () => {
  it('passes with valid data', () => {
    const { valid } = validateProductData({ name: 'Widget', price: 9.99 });
    expect(valid).toBe(true);
  });

  it('fails when price is negative', () => {
    const { valid } = validateProductData({ name: 'Widget', price: -1 });
    expect(valid).toBe(false);
  });
});
