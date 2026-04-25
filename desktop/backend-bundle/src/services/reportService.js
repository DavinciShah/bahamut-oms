const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL || `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT || 5432}/${process.env.DB_NAME}` });
const analyticsService = require('./analyticsService');

const reportService = {
  async createReport(tenantId, config, userId) {
    const { name, type, parameters } = config;
    const result = await pool.query(
      `INSERT INTO reports (tenant_id, name, type, config, created_by)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [tenantId, name, type, JSON.stringify(parameters || {}), userId]
    );
    return result.rows[0];
  },

  async getReports(tenantId) {
    const result = await pool.query(
      `SELECT * FROM reports WHERE tenant_id = $1 ORDER BY created_at DESC`,
      [tenantId]
    );
    return result.rows;
  },

  async runReport(reportId) {
    const report = await pool.query(`SELECT * FROM reports WHERE id = $1`, [reportId]);
    if (!report.rows[0]) throw new Error('Report not found');

    const { tenant_id, type, config } = report.rows[0];
    const params = config || {};
    const dateRange = {
      from: params.from ? new Date(params.from) : new Date(Date.now() - 30 * 86400000),
      to: params.to ? new Date(params.to) : new Date()
    };

    let data;
    switch (type) {
      case 'orders':
        data = await analyticsService.getOrderAnalytics(tenant_id, dateRange);
        break;
      case 'revenue':
        data = await analyticsService.getRevenueAnalytics(tenant_id, dateRange);
        break;
      case 'products':
        data = await analyticsService.getProductAnalytics(tenant_id, dateRange);
        break;
      case 'customers':
        data = await analyticsService.getCustomerAnalytics(tenant_id, dateRange);
        break;
      case 'custom':
        data = await reportService._runCustomQuery(tenant_id, params);
        break;
      default:
        data = await analyticsService.getDashboardMetrics(tenant_id);
    }

    return { report: report.rows[0], data, generated_at: new Date() };
  },

  async _runCustomQuery(tenantId, params) {
    const { dimension, metric, group_by } = params;
    const validDimensions = ['orders', 'products', 'customers'];
    const table = validDimensions.includes(dimension) ? dimension : 'orders';
    const result = await pool.query(
      `SELECT ${group_by || 'DATE_TRUNC(\'day\', created_at)'} as group_key,
              COUNT(*) as count,
              COALESCE(SUM(total_amount), 0) as total
       FROM ${table}
       WHERE tenant_id = $1
       GROUP BY group_key
       ORDER BY group_key DESC
       LIMIT 100`,
      [tenantId]
    );
    return result.rows;
  },

  async deleteReport(reportId) {
    const result = await pool.query(
      `DELETE FROM reports WHERE id = $1 RETURNING *`,
      [reportId]
    );
    return result.rows[0];
  }
};

module.exports = reportService;
