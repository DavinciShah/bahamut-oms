const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { Pool } = require('pg');
require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const logger = require('./config/logger');
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

// Security & logging middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(morgan('combined', {
  stream: { write: (msg) => logger.info(msg.trim()) }
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting — tighter limit on auth routes, broader on everything else
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});

// Database Connection
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});
app.use('/api/', limiter);

app.locals.db = pool;

// Health Check (no rate limit)
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authLimiter, require('./routes/authRoutes'));
app.use('/api/users', apiLimiter, require('./routes/usersRoutes'));
app.use('/api/orders', apiLimiter, require('./routes/ordersRoutes'));
app.use('/api/products', apiLimiter, require('./routes/productsRoutes'));
app.use('/api/admin', apiLimiter, require('./routes/adminRoutes'));
app.use('/api/integrations', apiLimiter, require('./routes/integrationRoutes'));
app.use('/api/sync', apiLimiter, require('./routes/syncRoutes'));
app.use('/api/accounting-reports', apiLimiter, require('./routes/accountingReportsRoutes'));
app.use('/api/notifications', apiLimiter, require('./routes/notificationRoutes'));
app.use('/api/inventory', apiLimiter, require('./routes/inventoryRoutes'));
app.use('/api/warehouses', apiLimiter, require('./routes/warehouseRoutes'));
app.use('/api/tenants', apiLimiter, require('./routes/tenantRoutes'));
app.use('/api/payments', apiLimiter, require('./routes/paymentRoutes'));
app.use('/api/analytics', apiLimiter, require('./routes/analyticsRoutes'));
app.use('/api/shipping', apiLimiter, require('./routes/shippingRoutes'));
app.use('/api/support', apiLimiter, require('./routes/ticketRoutes'));
app.use('/api/bi', apiLimiter, require('./routes/biRoutes'));
app.use('/webhooks/shipping', require('./webhooks/shippingWebhook'));

// Core OMS routes
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/warehouses', warehouseRoutes);
app.use('/api/tenants', tenantRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/shipping', shippingRoutes);
app.use('/api/support', ticketRoutes);
app.use('/api/bi', biRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Global error handler
app.use(errorHandler);

// Start cron jobs
autoSyncJob.start();
reconciliationJob.start();

module.exports = app;
