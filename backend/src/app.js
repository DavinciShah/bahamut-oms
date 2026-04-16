const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
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

app.locals.db = pool;

// Health Check (no rate limit)
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
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

// Error Handler
app.use(require('./middleware/errorHandler'));

module.exports = app;