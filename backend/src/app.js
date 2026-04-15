'use strict';

require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const logger = require('./config/logger');
const errorHandler = require('./middleware/errorHandler');

const integrationRoutes = require('./routes/integrationRoutes');
const syncRoutes = require('./routes/syncRoutes');
const accountingReportsRoutes = require('./routes/accountingReportsRoutes');
const webhookRoutes = require('./routes/webhookRoutes');

const autoSyncJob = require('./jobs/autoSyncJob');
const reconciliationJob = require('./jobs/reconciliationJob');

const app = express();

app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(morgan('combined', {
  stream: { write: (msg) => logger.info(msg.trim()) }
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { success: false, message: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/integrations', integrationRoutes);
app.use('/api/sync', syncRoutes);
app.use('/api/accounting-reports', accountingReportsRoutes);
app.use('/api/webhooks', webhookRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

app.use(errorHandler);

autoSyncJob.start();
reconciliationJob.start();

const PORT = process.env.PORT || 5000;

if (require.main === module) {
  app.listen(PORT, () => {
    logger.info(`Bahamut OMS backend running on port ${PORT}`);
  });
}

module.exports = app;
