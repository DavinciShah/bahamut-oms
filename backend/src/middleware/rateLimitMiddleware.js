'use strict';

/**
 * Simple in-memory rate limiter.
 * For production deployments with multiple instances, replace with
 * a Redis-backed solution (e.g. rate-limiter-flexible).
 *
 * @param {object} options
 * @param {number} options.windowMs   - Time window in milliseconds (default: 15 min)
 * @param {number} options.max        - Max requests per window per IP (default: 100)
 * @param {string} [options.message]  - Error message (optional)
 */
function rateLimit({ windowMs = 15 * 60 * 1000, max = 100, message } = {}) {
  const hits = new Map();

  // Periodically clean up expired entries
  const cleanup = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of hits.entries()) {
      if (now > entry.resetAt) hits.delete(key);
    }
  }, windowMs);
  if (cleanup.unref) cleanup.unref();

  return function rateLimitMiddleware(req, res, next) {
    const key =
      req.ip ||
      req.headers['x-forwarded-for'] ||
      req.connection?.remoteAddress ||
      'unknown';

    const now = Date.now();
    let entry = hits.get(key);

    if (!entry || now > entry.resetAt) {
      entry = { count: 0, resetAt: now + windowMs };
      hits.set(key, entry);
    }

    entry.count += 1;

    res.setHeader('X-RateLimit-Limit', max);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, max - entry.count));
    res.setHeader('X-RateLimit-Reset', Math.ceil(entry.resetAt / 1000));

    if (entry.count > max) {
      return res.status(429).json({
        error: message || 'Too many requests. Please try again later.',
      });
    }

    next();
  };
}

module.exports = rateLimit;
