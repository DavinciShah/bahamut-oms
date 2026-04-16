class OrderItem {
  static async findByOrderId(pool, orderId) {
    const { rows } = await pool.query(
      `SELECT oi.*, p.name AS product_name, p.sku
       FROM order_items oi
       LEFT JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = $1
       ORDER BY oi.id`,
      [orderId]
    );
    return rows;
  }

  static async create(pool, itemData) {
    const { order_id, product_id, quantity, unit_price } = itemData;
    const { rows } = await pool.query(
      `INSERT INTO order_items (order_id, product_id, quantity, unit_price)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [order_id, product_id, quantity, unit_price]
    );
    return rows[0];
  }

  static async delete(pool, id) {
    const { rowCount } = await pool.query('DELETE FROM order_items WHERE id = $1', [id]);
    return rowCount > 0;
  }
}

module.exports = OrderItem;
