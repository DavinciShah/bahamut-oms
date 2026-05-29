const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { RedisStore } = require('rate-limit-redis');
require('dotenv').config();

const logger = require('./config/logger');
const db = require('./config/database');
const redis = require('./config/redis');
const errorHandler = require('./middleware/errorHandler');

// Accounting integration routes
const integrationRoutes = require('./routes/integrationRoutes');
const syncRoutes = require('./routes/syncRoutes');
const accountingReportsRoutes = require('./routes/accountingReportsRoutes');
const webhookRoutes = require('./routes/webhookRoutes');

// Core OMS routes
const authRoutes = require('./routes/authRoutes');
const usersRoutes = require('./routes/usersRoutes');
const ordersRoutes = require('./routes/ordersRoutes');
const productsRoutes = require('./routes/productsRoutes');
const adminRoutes = require('./routes/adminRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const warehouseRoutes = require('./routes/warehouseRoutes');
const tenantRoutes = require('./routes/tenantRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const shippingRoutes = require('./routes/shippingRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const biRoutes = require('./routes/biRoutes');

// Jobs
const autoSyncJob = require('./jobs/autoSyncJob');
const reconciliationJob = require('./jobs/reconciliationJob');

const app = express();
app.locals.db = db;

const defaultCorsOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'app://local',
  'capacitor://localhost',
];

function getAllowedCorsOrigins() {
  const raw = process.env.CORS_ORIGIN;
  if (!raw || !raw.trim()) {
    return defaultCorsOrigins;
  }

  return raw
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

const allowedCorsOrigins = getAllowedCorsOrigins();

// Security & logging middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc:  ["'none'"],
      scriptSrc:   ["'none'"],
      styleSrc:    ["'none'"],
      imgSrc:      ["'none'"],
      connectSrc:  ["'none'"],
      objectSrc:   ["'none'"],
      frameSrc:    ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: true,
  crossOriginOpenerPolicy:   { policy: 'same-origin' },
  crossOriginResourcePolicy: { policy: 'same-origin' },
  hsts: {
    maxAge:            31_536_000, // 1 year in seconds
    includeSubDomains: true,
    preload:           true,
  },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
}));
app.use(cors({
  origin: (origin, callback) => {
    // No Origin header: sent by server-to-server calls, native apps (Capacitor/Electron),
    // and — critically — sandboxed <iframe>s/data: URIs (a known CORS bypass vector).
    // Block unconditionally in production unless explicitly opted-in.
    if (!origin) {
      if (
        process.env.NODE_ENV === 'production' &&
        process.env.CORS_ALLOW_NULL_ORIGIN !== 'true'
      ) {
        callback(new Error('Not allowed by CORS'));
        return;
      }
      callback(null, true);
      return;
    }

    if (allowedCorsOrigins.includes('*') || allowedCorsOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(morgan('combined', {
  stream: { write: (msg) => logger.info(msg.trim()) }
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting — tighter limit on auth routes, broader on everything else.
// Uses a Redis store when REDIS_URL is configured so counters are shared across
// all horizontally scaled backend instances; falls back to in-memory for local dev.
function makeStore(prefix) {
  const client = redis.getClient();
  if (!client) return undefined; // express-rate-limit defaults to MemoryStore
  return new RedisStore({ sendCommand: (...args) => client.call(...args), prefix });
}

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
  store: makeStore('rl:auth:'),
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 200,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
  store: makeStore('rl:api:'),
});

// Health Check (no rate limit)
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.get('/api/health/database', async (req, res) => {
  try {
    await db.query('SELECT 1');
    res.json({
      status: 'OK',
      database: 'connected',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error(`Database health check failed: ${error.message}`);
    res.status(503).json({
      status: 'ERROR',
      database: 'disconnected',
      timestamp: new Date().toISOString(),
    });
  }
});

// Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/users', apiLimiter, usersRoutes);
app.use('/api/orders', apiLimiter, ordersRoutes);
app.use('/api/products', apiLimiter, productsRoutes);
app.use('/api/admin', apiLimiter, adminRoutes);
app.use('/api/integrations', apiLimiter, integrationRoutes);
app.use('/api/sync', apiLimiter, syncRoutes);
app.use('/api/accounting-reports', apiLimiter, accountingReportsRoutes);
app.use('/api/notifications', apiLimiter, notificationRoutes);
app.use('/api/inventory', apiLimiter, inventoryRoutes);
app.use('/api/warehouses', apiLimiter, warehouseRoutes);
app.use('/api/tenants', apiLimiter, tenantRoutes);
app.use('/api/payments', apiLimiter, paymentRoutes);
app.use('/api/analytics', apiLimiter, analyticsRoutes);
app.use('/api/shipping', apiLimiter, shippingRoutes);
app.use('/api/support', apiLimiter, ticketRoutes);
app.use('/api/bi', apiLimiter, biRoutes);
app.use('/webhooks/shipping', require('./webhooks/shippingWebhook'));
app.use('/api/webhooks', apiLimiter, webhookRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Global error handler
app.use(errorHandler);

// Start cron jobs
if (process.env.NODE_ENV !== 'test' && process.env.DISABLE_JOBS !== 'true') {
  autoSyncJob.start();
  reconciliationJob.start();
}

module.exports = app;
