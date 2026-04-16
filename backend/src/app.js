'use strict';

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

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { success: false, message: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Accounting integration routes
app.use('/api/integrations', integrationRoutes);
app.use('/api/sync', syncRoutes);
app.use('/api/accounting-reports', accountingReportsRoutes);
app.use('/api/webhooks', webhookRoutes);

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
