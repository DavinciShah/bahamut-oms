'use strict';

const Redis = require('ioredis');
const logger = require('./logger');

let redisClient = null;

/**
 * Returns a shared ioredis client when REDIS_URL is configured, or null otherwise.
 *
 * Callers should treat null as "Redis unavailable — use in-memory fallback".
 * The connection is lazy: the first call to getClient() establishes it.
 */
function getClient() {
  if (redisClient) return redisClient;

  const url = process.env.REDIS_URL;
  if (!url) {
    if (process.env.NODE_ENV === 'production') {
      logger.warn(
        '[redis] REDIS_URL is not set in production — rate limiters will fall back to in-memory storage (NOT safe for multi-instance deployments)'
      );
    }
    return null;
  }

  const client = new Redis(url, {
    // Do not crash the process on initial connection failure — log and degrade.
    lazyConnect: true,
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    retryStrategy(times) {
      const delay = Math.min(times * 100, 3000);
      return delay;
    },
  });

  client.on('connect', () => logger.info('[redis] Connected'));
  client.on('ready',   () => logger.info('[redis] Ready'));
  client.on('error',   (err) => logger.error(`[redis] Error: ${err.message}`));
  client.on('close',   () => logger.warn('[redis] Connection closed'));

  client.connect().catch((err) => {
    logger.error(`[redis] Initial connection failed: ${err.message}`);
  });

  redisClient = client;
  return redisClient;
}

module.exports = { getClient };
