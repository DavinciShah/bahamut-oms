'use strict';

const { Pool } = require('pg');

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT || 5432}/${process.env.DB_NAME}`,
});

const VALID_STATUSES = ['pending', 'in_transit', 'completed', 'cancelled'];

const StockTransfer = {
  async findAll({ fromWarehouseId, toWarehouseId, status, limit = 50, offset = 0 } = {}) {
    const conditions = [];
    const values = [];
    let i = 1;

    if (fromWarehouseId) { conditions.push(`st.from_warehouse_id = $${i++}`); values.push(fromWarehouseId); }
    if (toWarehouseId)   { conditions.push(`st.to_warehouse_id = $${i++}`);   values.push(toWarehouseId); }
    if (status)          { conditions.push(`st.status = $${i++}`);            values.push(status); }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    values.push(limit, offset);

    const { rows } = await pool.query(
      `SELECT st.*,
         fw.name AS from_warehouse_name,
         tw.name AS to_warehouse_name,
         p.name  AS product_name,
         p.sku
       FROM stock_transfers st
       LEFT JOIN warehouses fw ON fw.id = st.from_warehouse_id
       LEFT JOIN warehouses tw ON tw.id = st.to_warehouse_id
       LEFT JOIN products   p  ON p.id  = st.product_id
       ${where}
       ORDER BY st.created_at DESC
       LIMIT $${i} OFFSET $${i + 1}`,
      values
    );
    return rows;
  },

  async findById(id) {
    const { rows } = await pool.query(
      `SELECT st.*,
         fw.name AS from_warehouse_name,
         tw.name AS to_warehouse_name,
         p.name  AS product_name
       FROM stock_transfers st
       LEFT JOIN warehouses fw ON fw.id = st.from_warehouse_id
       LEFT JOIN warehouses tw ON tw.id = st.to_warehouse_id
       LEFT JOIN products   p  ON p.id  = st.product_id
       WHERE st.id = $1`,
      [id]
    );
    return rows[0] || null;
  },

  async create({ fromWarehouseId, toWarehouseId, productId, quantity, notes = null, createdBy }) {
    const { rows } = await pool.query(
      `INSERT INTO stock_transfers
         (from_warehouse_id, to_warehouse_id, product_id, quantity, status, notes, created_by, created_at)
       VALUES ($1, $2, $3, $4, 'pending', $5, $6, NOW())
       RETURNING *`,
      [fromWarehouseId, toWarehouseId, productId, quantity, notes, createdBy]
    );
    return rows[0];
  },

  async updateStatus(id, status) {
    if (!VALID_STATUSES.includes(status)) {
      throw new Error(`Invalid status: ${status}`);
    }
    const completedAt = status === 'completed' ? 'NOW()' : 'NULL';
    const { rows } = await pool.query(
      `UPDATE stock_transfers
       SET status = $2, completed_at = ${completedAt}
       WHERE id = $1
       RETURNING *`,
      [id, status]
    );
    return rows[0] || null;
  },
};

module.exports = StockTransfer;
