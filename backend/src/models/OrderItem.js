const { query } = require('../config/database');

class OrderItem {
  static async findByOrderId(orderId) {
    const result = await query(
      `SELECT oi.*, p.name as product_name, p.sku as product_sku
       FROM order_items oi
       LEFT JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = $1
       ORDER BY oi.id`,
      [orderId]
    );
    return result.rows;
  }

  static async createBulk(orderId, items, client) {
    const db = client || { query: (text, params) => require('../config/database').query(text, params) };
    const results = [];
    for (const item of items) {
      const result = await db.query(
        'INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES ($1, $2, $3, $4) RETURNING *',
        [orderId, item.productId, item.quantity, item.unitPrice]
      );
      results.push(result.rows[0]);
    }
    return results;
  }

  static async deleteByOrderId(orderId) {
    const result = await query('DELETE FROM order_items WHERE order_id = $1 RETURNING *', [orderId]);
    return result.rows;
  }
}

module.exports = OrderItem;
