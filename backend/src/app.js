const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

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

// Health Check (no rate limit)
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
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
