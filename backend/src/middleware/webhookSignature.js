'use strict';

const crypto = require('crypto');
const logger = require('../config/logger');

/**
 * Returns an Express middleware that verifies the HMAC-SHA256 signature of the
 * raw request body sent by a webhook provider.
 *
 * The expected header value is:  sha256=<hex-digest>
 * (the same convention used by GitHub, Stripe, and our own outbound delivery).
 *
 * Usage:
 *   router.post('/hook',
 *     express.raw({ type: '*\/*' }),
 *     verifyWebhookSignature('SHIPPING_WEBHOOK_SECRET', 'x-shipping-signature'),
 *     handler
 *   );
 *
 * @param {string} secretEnvKey  - Name of the process.env variable that holds the shared secret.
 * @param {string} [headerName]  - HTTP header carrying the signature (default: 'x-webhook-signature').
 * @returns {import('express').RequestHandler}
 */
function verifyWebhookSignature(secretEnvKey, headerName = 'x-webhook-signature') {
  return function webhookSignatureMiddleware(req, res, next) {
    const secret = process.env[secretEnvKey];

    // Fail closed: if the secret is not configured in production, reject all requests.
    if (!secret) {
      if (process.env.NODE_ENV === 'production') {
        logger.error(
          `[webhookSignature] ${secretEnvKey} is not set — rejecting webhook request`
        );
        return res.status(500).json({ error: 'Webhook secret not configured' });
      }
      // In non-production environments warn and skip verification to ease local dev.
      logger.warn(
        `[webhookSignature] ${secretEnvKey} is not set — skipping signature check (non-production)`
      );
      return next();
    }

    const rawBody = req.body;
    if (!Buffer.isBuffer(rawBody)) {
      logger.error(
        '[webhookSignature] req.body is not a Buffer — ensure express.raw() runs before this middleware'
      );
      return res.status(500).json({ error: 'Server misconfiguration: raw body unavailable' });
    }

    const incomingHeader = req.headers[headerName.toLowerCase()];
    if (!incomingHeader) {
      return res.status(401).json({ error: `Missing ${headerName} header` });
    }

    // Accept both bare hex and the "sha256=<hex>" prefix.
    const incomingHex = incomingHeader.startsWith('sha256=')
      ? incomingHeader.slice(7)
      : incomingHeader;

    const expected = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex');

    let signaturesMatch;
    try {
      signaturesMatch = crypto.timingSafeEqual(
        Buffer.from(expected, 'hex'),
        Buffer.from(incomingHex, 'hex')
      );
    } catch {
      // timingSafeEqual throws if the buffers have different lengths (i.e. malformed hex).
      signaturesMatch = false;
    }

    if (!signaturesMatch) {
      logger.warn('[webhookSignature] Signature mismatch', {
        path: req.path,
        header: headerName,
      });
      return res.status(401).json({ error: 'Invalid webhook signature' });
    }

    next();
  };
}

module.exports = verifyWebhookSignature;
