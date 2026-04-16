const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL || `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT || 5432}/${process.env.DB_NAME}` });

function mean(values) {
  return values.reduce((a, b) => a + b, 0) / (values.length || 1);
}

function stdDev(values) {
  const m = mean(values);
  const variance = values.reduce((acc, v) => acc + Math.pow(v - m, 2), 0) / (values.length || 1);
  return Math.sqrt(variance);
}

const anomalyDetectionService = {
  async detectRevenueAnomalies(tenantId) {
    const result = await pool.query(
      `SELECT DATE_TRUNC('day', created_at) AS day,
              COALESCE(SUM(total_amount), 0) AS revenue
       FROM orders
       WHERE tenant_id = $1 AND status = 'completed'
         AND created_at >= NOW() - INTERVAL '90 days'
       GROUP BY day ORDER BY day`,
      [tenantId]
    );

    const rows = result.rows;
    if (rows.length < 7) return [];

    const revenues = rows.map(r => parseFloat(r.revenue));
    const avg = mean(revenues);
    const std = stdDev(revenues);
    const threshold = 2.5;

    const anomalies = rows
      .map((row, i) => ({
        date: row.day,
        revenue: revenues[i],
        zscore: std > 0 ? Math.abs((revenues[i] - avg) / std) : 0
      }))
      .filter(r => r.zscore > threshold)
      .map(r => ({
        ...r,
        type: r.revenue > avg ? 'spike' : 'drop',
        severity: r.zscore > 3.5 ? 'high' : 'medium',
        message: `Revenue ${r.type === 'spike' ? 'spike' : 'drop'} detected: $${r.revenue.toFixed(2)} (avg: $${avg.toFixed(2)})`
      }));

    return anomalies;
  },

  async detectInventoryAnomalies(tenantId) {
    const result = await pool.query(
      `SELECT il.product_id, p.name, p.sku,
              il.quantity, p.reorder_point,
              il.quantity - p.reorder_point AS buffer
       FROM inventory_levels il
       JOIN products p ON p.id = il.product_id
       WHERE p.tenant_id = $1`,
      [tenantId]
    );

    return result.rows
      .filter(r => r.quantity <= 0 || r.buffer < 0)
      .map(r => ({
        product_id: r.product_id,
        product_name: r.name,
        sku: r.sku,
        current_stock: r.quantity,
        reorder_point: r.reorder_point,
        type: r.quantity <= 0 ? 'out_of_stock' : 'low_stock',
        severity: r.quantity <= 0 ? 'high' : 'medium',
        message: r.quantity <= 0
          ? `${r.name} is out of stock`
          : `${r.name} is below reorder point (${r.quantity} remaining)`
      }));
  },

  async getAlerts(tenantId) {
    const [revenueAnomalies, inventoryAnomalies] = await Promise.all([
      anomalyDetectionService.detectRevenueAnomalies(tenantId),
      anomalyDetectionService.detectInventoryAnomalies(tenantId)
    ]);

    return {
      revenue_anomalies: revenueAnomalies,
      inventory_anomalies: inventoryAnomalies,
      total_alerts: revenueAnomalies.length + inventoryAnomalies.length,
      high_severity: [...revenueAnomalies, ...inventoryAnomalies].filter(a => a.severity === 'high').length
    };
  }
};

module.exports = anomalyDetectionService;
