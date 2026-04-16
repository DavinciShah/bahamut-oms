'use strict';

const { Pool } = require('pg');
const Warehouse = require('../models/Warehouse');

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT || 5432}/${process.env.DB_NAME}`,
});

const warehouseService = {
  async getAll(options = {}) {
    return Warehouse.findAll(options);
  },

  async getById(id) {
    const warehouse = await Warehouse.findById(id);
    if (!warehouse) throw Object.assign(new Error('Warehouse not found'), { status: 404 });
    return warehouse;
  },

  async getActiveWarehouses() {
    return Warehouse.findAll({ activeOnly: true });
  },

  async create(data) {
    const existing = await Warehouse.findByCode(data.code);
    if (existing) {
      throw Object.assign(new Error(`Warehouse code '${data.code}' already in use`), { status: 409 });
    }
    return Warehouse.create(data);
  },

  async update(id, data) {
    await this.getById(id);
    const updated = await Warehouse.update(id, data);
    if (!updated) throw Object.assign(new Error('Warehouse not found'), { status: 404 });
    return updated;
  },

  async delete(id) {
    await this.getById(id);
    return Warehouse.delete(id);
  },

  async getWarehouseStats(id) {
    await this.getById(id);
    const { rows } = await pool.query(
      `SELECT
         COUNT(il.id)         AS product_count,
         SUM(il.quantity)     AS total_units,
         SUM(il.reserved_quantity) AS reserved_units,
         COUNT(CASE WHEN il.quantity <= il.reorder_point THEN 1 END) AS low_stock_count
       FROM inventory_levels il
       WHERE il.warehouse_id = $1`,
      [id]
    );
    return rows[0];
  },
};

module.exports = warehouseService;
