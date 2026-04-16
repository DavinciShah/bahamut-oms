'use strict';

const crypto = require('crypto');

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const TAG_LENGTH = 16;
const SALT_LENGTH = 32;

const encryptionService = {
  /**
   * Encrypt plaintext with AES-256-GCM.
   * @param {string} text  - Plaintext to encrypt
   * @param {string} [key] - 32-byte hex key; defaults to process.env.ENCRYPTION_KEY
   * @returns {string} base64-encoded payload: salt:iv:tag:ciphertext
   */
  encrypt(text, key) {
    const rawKey = key
      ? Buffer.from(key, 'hex')
      : this._getDefaultKey();

    const salt = crypto.randomBytes(SALT_LENGTH);
    const iv   = crypto.randomBytes(IV_LENGTH);
    const derivedKey = crypto.scryptSync(rawKey, salt, 32);

    const cipher = crypto.createCipheriv(ALGORITHM, derivedKey, iv);
    const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();

    const payload = Buffer.concat([salt, iv, tag, encrypted]);
    return payload.toString('base64');
  },

  /**
   * Decrypt payload produced by encrypt().
   * @param {string} encrypted - base64-encoded payload
   * @param {string} [key]     - 32-byte hex key
   * @returns {string} decrypted plaintext
   */
  decrypt(encrypted, key) {
    const rawKey = key
      ? Buffer.from(key, 'hex')
      : this._getDefaultKey();

    const buf  = Buffer.from(encrypted, 'base64');
    const salt = buf.slice(0, SALT_LENGTH);
    const iv   = buf.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
    const tag  = buf.slice(SALT_LENGTH + IV_LENGTH, SALT_LENGTH + IV_LENGTH + TAG_LENGTH);
    const data = buf.slice(SALT_LENGTH + IV_LENGTH + TAG_LENGTH);

    const derivedKey = crypto.scryptSync(rawKey, salt, 32);
    const decipher = crypto.createDecipheriv(ALGORITHM, derivedKey, iv);
    decipher.setAuthTag(tag);

    return decipher.update(data) + decipher.final('utf8');
  },

  /**
   * Generate a cryptographically secure 32-byte hex key.
   */
  generateKey() {
    return crypto.randomBytes(32).toString('hex');
  },

  /**
   * Hash data with SHA-256 (hex).
   */
  hashData(data) {
    return crypto.createHash('sha256').update(String(data)).digest('hex');
  },

  _getDefaultKey() {
    const k = process.env.ENCRYPTION_KEY;
    if (!k) throw new Error('ENCRYPTION_KEY environment variable is not set');
    return Buffer.from(k, 'hex');
  },
};

module.exports = encryptionService;
