const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database Connection
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

app.locals.db = pool;

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/usersRoutes'));
app.use('/api/orders', require('./routes/ordersRoutes'));
app.use('/api/products', require('./routes/productsRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/integrations', require('./routes/integrationRoutes'));
app.use('/api/sync', require('./routes/syncRoutes'));
app.use('/api/accounting-reports', require('./routes/accountingReportsRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/inventory', require('./routes/inventoryRoutes'));
app.use('/api/warehouses', require('./routes/warehouseRoutes'));
app.use('/api/tenants', require('./routes/tenantRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/shipping', require('./routes/shippingRoutes'));
app.use('/api/support', require('./routes/ticketRoutes'));
app.use('/api/bi', require('./routes/biRoutes'));
app.use('/webhooks/shipping', require('./webhooks/shippingWebhook'));

// Error Handler
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || err.status || 500;
  if (statusCode >= 500) console.error(err);
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

module.exports = app;