const dataWarehouseService = require('../services/dataWarehouseService');
const etlService = require('../services/etlService');
const predictiveAnalyticsService = require('../services/predictiveAnalyticsService');
const anomalyDetectionService = require('../services/anomalyDetectionService');
const DataWarehouseFact = require('../models/DataWarehouseFact');

const biController = {
  async getDashboard(req, res) {
    try {
      const tenantId = req.user.tenant_id;
      const [churn, revenue, anomalies] = await Promise.all([
        predictiveAnalyticsService.predictChurn(tenantId),
        predictiveAnalyticsService.predictRevenue(tenantId, 3),
        anomalyDetectionService.getAlerts(tenantId)
      ]);
      res.json({ churn_risk_count: churn.filter(c => c.churn_risk === 'high').length, revenue_predictions: revenue.predictions.slice(0, 3), anomaly_alerts: anomalies.total_alerts });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  },

  async getFactSales(req, res) {
    try {
      const tenantId = req.user.tenant_id;
      const { from, to, dimension, metric } = req.query;
      let data;
      if (dimension && metric) {
        data = await dataWarehouseService.aggregateByDimension(tenantId, dimension, metric);
      } else if (from && to) {
        data = await dataWarehouseService.getFactsByDateRange(tenantId, from, to);
      } else {
        data = await DataWarehouseFact.findByTenant(tenantId);
      }
      res.json(data);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  },

  async runETL(req, res) {
    try {
      const tenantId = req.user.tenant_id;
      const { from, to } = req.body;
      const dateRange = {};
      if (from) dateRange.from = new Date(from);
      if (to) dateRange.to = new Date(to);
      const result = await etlService.runETL(tenantId, dateRange);
      res.json(result);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  },

  async getRevenuePredictions(req, res) {
    try {
      const tenantId = req.user.tenant_id;
      const { months = 6 } = req.query;
      const data = await predictiveAnalyticsService.predictRevenue(tenantId, parseInt(months));
      res.json(data);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  },

  async getChurnPredictions(req, res) {
    try {
      const tenantId = req.user.tenant_id;
      const data = await predictiveAnalyticsService.predictChurn(tenantId);
      res.json(data);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  },

  async getAnomalies(req, res) {
    try {
      const tenantId = req.user.tenant_id;
      const alerts = await anomalyDetectionService.getAlerts(tenantId);
      res.json(alerts);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  }
};

module.exports = biController;
