'use strict';

const inventoryService = require('../services/inventoryService');

const inventoryController = {
  async getStockLevels(req, res) {
    try {
      const { warehouseId, productId, limit, offset } = req.query;
      const result = await inventoryService.getStockLevels(warehouseId, {
        productId,
        limit: limit ? parseInt(limit, 10) : 50,
        offset: offset ? parseInt(offset, 10) : 0,
      });
      res.json({ success: true, ...result });
    } catch (err) {
      console.error('[inventoryController.getStockLevels]', err);
      res.status(err.status || 500).json({ success: false, error: err.message });
    }
  },

  async adjustStock(req, res) {
    try {
      const { warehouseId, productId, quantity, reason } = req.body;
      if (!warehouseId || !productId || quantity === undefined) {
        return res.status(400).json({ success: false, error: 'warehouseId, productId, and quantity are required' });
      }
      const result = await inventoryService.adjustStock(
        warehouseId, productId, quantity, reason || 'manual', req.user.id
      );
      res.json({ success: true, data: result });
    } catch (err) {
      console.error('[inventoryController.adjustStock]', err);
      res.status(err.status || 500).json({ success: false, error: err.message });
    }
  },

  async transferStock(req, res) {
    try {
      const { fromWarehouseId, toWarehouseId, productId, quantity } = req.body;
      if (!fromWarehouseId || !toWarehouseId || !productId || !quantity) {
        return res.status(400).json({ success: false, error: 'fromWarehouseId, toWarehouseId, productId, quantity are required' });
      }
      const result = await inventoryService.transferStock(
        fromWarehouseId, toWarehouseId, productId, quantity, req.user.id
      );
      res.json({ success: true, data: result });
    } catch (err) {
      console.error('[inventoryController.transferStock]', err);
      res.status(err.status || 500).json({ success: false, error: err.message });
    }
  },

  async getLowStockAlerts(req, res) {
    try {
      const threshold = req.query.threshold ? parseInt(req.query.threshold, 10) : 10;
      const items = await inventoryService.getLowStockAlerts(threshold);
      res.json({ success: true, data: items });
    } catch (err) {
      console.error('[inventoryController.getLowStockAlerts]', err);
      res.status(err.status || 500).json({ success: false, error: err.message });
    }
  },

  async getStockHistory(req, res) {
    try {
      const { productId, warehouseId } = req.query;
      if (!productId) {
        return res.status(400).json({ success: false, error: 'productId is required' });
      }
      const history = await inventoryService.getStockHistory(productId, warehouseId);
      res.json({ success: true, data: history });
    } catch (err) {
      console.error('[inventoryController.getStockHistory]', err);
      res.status(err.status || 500).json({ success: false, error: err.message });
    }
  },
};

module.exports = inventoryController;
