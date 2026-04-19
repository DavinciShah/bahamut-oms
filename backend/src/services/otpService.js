'use strict';

const crypto = require('crypto');
const authConfig = require('../config/auth');

// In-memory OTP store (replace with Redis or DB in production).
const otpStore = new Map();

const OTP_DIGITS = 6;
const OTP_EXPIRY_MS = authConfig.otpExpiry || 5 * 60 * 1000;
const TOTP_STEP = 30; // seconds
const TOTP_DIGITS = 6;

function base32Decode(encoded) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  const str = encoded.toUpperCase().replace(/=+$/, '');
  let bits = 0;
  let value = 0;
  const output = [];
  for (const ch of str) {
    const idx = alphabet.indexOf(ch);
    if (idx === -1) continue;
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      output.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }
  return Buffer.from(output);
}

function hotp(secret, counter) {
  const buf = Buffer.alloc(8);
  let tmp = counter;
  for (let i = 7; i >= 0; i--) {
    buf[i] = tmp & 0xff;
    tmp = Math.floor(tmp / 256);
  }
  const keyBuf = base32Decode(secret);
  const hmac = crypto.createHmac('sha1', keyBuf).update(buf).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  const code =
    (((hmac[offset] & 0x7f) << 24) |
      ((hmac[offset + 1] & 0xff) << 16) |
      ((hmac[offset + 2] & 0xff) << 8) |
      (hmac[offset + 3] & 0xff)) %
    Math.pow(10, TOTP_DIGITS);
  return String(code).padStart(TOTP_DIGITS, '0');
}

function currentCounter() {
  return Math.floor(Date.now() / 1000 / TOTP_STEP);
}

const otpService = {
  /**
   * Generate a random numeric OTP and store it keyed by identifier.
   */
  generateOTP(identifier) {
    const code = String(crypto.randomInt(0, Math.pow(10, OTP_DIGITS))).padStart(OTP_DIGITS, '0');
    const expiresAt = Date.now() + OTP_EXPIRY_MS;
    otpStore.set(String(identifier), { code, expiresAt });
    return code;
  },

  /**
   * Verify a stored OTP. Returns true on success and removes the entry.
   */
  verifyOTP(identifier, code) {
    const key = String(identifier);
    const entry = otpStore.get(key);
    if (!entry) return false;
    if (Date.now() > entry.expiresAt) {
      otpStore.delete(key);
      return false;
    }
    if (entry.code !== String(code)) return false;
    otpStore.delete(key);
    return true;
  },

  /**
   * Generate a base32-encoded TOTP secret for a user.
   */
  generateTOTPSecret(userId) {
    const raw = crypto.randomBytes(20);
    // Simple base32 encoding (RFC 4648)
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let bits = 0;
    let value = 0;
    let secret = '';
    for (const byte of raw) {
      value = (value << 8) | byte;
      bits += 8;
      while (bits >= 5) {
        secret += alphabet[(value >>> (bits - 5)) & 31];
        bits -= 5;
      }
    }
    if (bits > 0) secret += alphabet[(value << (5 - bits)) & 31];

    const issuer = process.env.APP_NAME || 'BahamutOMS';
    const otpauthUrl = `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(String(userId))}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=${TOTP_DIGITS}&period=${TOTP_STEP}`;
    return { secret, otpauthUrl };
  },

  /**
   * Verify a TOTP code against the secret. Allows ±1 step window.
   */
  verifyTOTP(secret, token) {
    if (!secret || !token) return false;
    const counter = currentCounter();
    for (let delta = -1; delta <= 1; delta++) {
      if (hotp(secret, counter + delta) === String(token)) return true;
    }
    return false;
  },
};

module.exports = otpService;
