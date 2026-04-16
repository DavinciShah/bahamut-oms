const analyticsService = require('../services/analyticsService');
const reportService = require('../services/reportService');
const exportService = require('../services/exportService');
const forecastingService = require('../services/forecastingService');

const analyticsController = {
  async getDashboard(req, res) {
    try {
      const tenantId = req.user.tenant_id;
      const metrics = await analyticsService.getDashboardMetrics(tenantId);
      res.json(metrics);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  },

  async getOrderAnalytics(req, res) {
    try {
      const tenantId = req.user.tenant_id;
      const { from, to } = req.query;
      const dateRange = {};
      if (from) dateRange.from = new Date(from);
      if (to) dateRange.to = new Date(to);
      const data = await analyticsService.getOrderAnalytics(tenantId, dateRange);
      res.json(data);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  },

  async getRevenueAnalytics(req, res) {
    try {
      const tenantId = req.user.tenant_id;
      const { from, to } = req.query;
      const dateRange = {};
      if (from) dateRange.from = new Date(from);
      if (to) dateRange.to = new Date(to);
      const data = await analyticsService.getRevenueAnalytics(tenantId, dateRange);
      res.json(data);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  },

  async getProductAnalytics(req, res) {
    try {
      const tenantId = req.user.tenant_id;
      const { from, to } = req.query;
      const dateRange = {};
      if (from) dateRange.from = new Date(from);
      if (to) dateRange.to = new Date(to);
      const data = await analyticsService.getProductAnalytics(tenantId, dateRange);
      res.json(data);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  },

  async getReports(req, res) {
    try {
      const tenantId = req.user.tenant_id;
      const reports = await reportService.getReports(tenantId);
      res.json(reports);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  },

  async createReport(req, res) {
    try {
      const tenantId = req.user.tenant_id;
      const userId = req.user.id;
      const report = await reportService.createReport(tenantId, req.body, userId);
      res.status(201).json(report);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  },

  async runReport(req, res) {
    try {
      const { id } = req.params;
      const result = await reportService.runReport(id);
      res.json(result);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  },

  async exportReport(req, res) {
    try {
      const { id } = req.params;
      const { format = 'csv' } = req.query;
      const result = await reportService.runReport(id);
      const rows = Array.isArray(result.data) ? result.data : [result.data];

      if (format === 'pdf') {
        const buffer = await exportService.exportToPDF(rows, result.report.name);
        res.set('Content-Type', 'application/pdf');
        res.set('Content-Disposition', `attachment; filename="report-${id}.pdf"`);
        return res.send(buffer);
      }

      const buffer = exportService.exportToCSV(rows, `report-${id}`);
      res.set('Content-Type', 'text/csv');
      res.set('Content-Disposition', `attachment; filename="report-${id}.csv"`);
      res.send(buffer);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  },

  async getForecast(req, res) {
    try {
      const tenantId = req.user.tenant_id;
      const { periods = 6 } = req.query;
      const data = await forecastingService.forecastRevenue(tenantId, parseInt(periods));
      res.json(data);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  }
};

module.exports = analyticsController;
