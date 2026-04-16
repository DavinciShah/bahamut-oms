'use strict';

const warehouseService = require('../services/warehouseService');

const warehouseController = {
  async getAll(req, res) {
    try {
      const activeOnly = req.query.active === 'true';
      const warehouses = await warehouseService.getAll({ activeOnly });
      res.json({ success: true, data: warehouses });
    } catch (err) {
      console.error('[warehouseController.getAll]', err);
      res.status(err.status || 500).json({ success: false, error: err.message });
    }
  },

  async getById(req, res) {
    try {
      const warehouse = await warehouseService.getById(req.params.id);
      res.json({ success: true, data: warehouse });
    } catch (err) {
      console.error('[warehouseController.getById]', err);
      res.status(err.status || 500).json({ success: false, error: err.message });
    }
  },

  async create(req, res) {
    try {
      const { name, code, address, city, country, managerId } = req.body;
      if (!name || !code) {
        return res.status(400).json({ success: false, error: 'name and code are required' });
      }
      const warehouse = await warehouseService.create({ name, code, address, city, country, managerId });
      res.status(201).json({ success: true, data: warehouse });
    } catch (err) {
      console.error('[warehouseController.create]', err);
      res.status(err.status || 500).json({ success: false, error: err.message });
    }
  },

  async update(req, res) {
    try {
      const warehouse = await warehouseService.update(req.params.id, req.body);
      res.json({ success: true, data: warehouse });
    } catch (err) {
      console.error('[warehouseController.update]', err);
      res.status(err.status || 500).json({ success: false, error: err.message });
    }
  },

  async delete(req, res) {
    try {
      await warehouseService.delete(req.params.id);
      res.json({ success: true, message: 'Warehouse deleted' });
    } catch (err) {
      console.error('[warehouseController.delete]', err);
      res.status(err.status || 500).json({ success: false, error: err.message });
    }
  },

  async getStats(req, res) {
    try {
      const stats = await warehouseService.getWarehouseStats(req.params.id);
      res.json({ success: true, data: stats });
    } catch (err) {
      console.error('[warehouseController.getStats]', err);
      res.status(err.status || 500).json({ success: false, error: err.message });
    }
  },
};

module.exports = warehouseController;
