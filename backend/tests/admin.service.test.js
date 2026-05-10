'use strict';

jest.mock('../src/config/database', () => ({
  query: jest.fn()
}));

const { query } = require('../src/config/database');
const adminService = require('../src/services/adminService');

describe('adminService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getStats', () => {
    it('returns parsed dashboard stats', async () => {
      query
        .mockResolvedValueOnce({ rows: [{ count: '10' }] })
        .mockResolvedValueOnce({ rows: [{ count: '20' }] })
        .mockResolvedValueOnce({ rows: [{ total: '300.55' }] })
        .mockResolvedValueOnce({ rows: [{ count: '5' }] })
        .mockResolvedValueOnce({ rows: [{ count: '3' }] });

      const result = await adminService.getStats();

      expect(query).toHaveBeenCalledTimes(5);
      expect(result).toEqual({
        totalUsers: 10,
        totalOrders: 20,
        totalRevenue: 300.55,
        totalProducts: 5,
        pendingOrders: 3
      });
    });
  });

  describe('getOrdersReport', () => {
    it('returns orders and summary with provided date range', async () => {
      const startDate = '2024-01-01';
      const endDate = '2024-01-31';
      const orders = [{ id: 1 }, { id: 2 }];
      const summary = { total_orders: '2', total_revenue: '99.99', avg_order_value: '49.995' };

      query
        .mockResolvedValueOnce({ rows: orders })
        .mockResolvedValueOnce({ rows: [summary] });

      const result = await adminService.getOrdersReport(startDate, endDate);

      expect(query).toHaveBeenNthCalledWith(1, expect.any(String), [startDate, endDate]);
      expect(query).toHaveBeenNthCalledWith(2, expect.any(String), [startDate, endDate]);
      expect(result).toEqual({ orders, summary });
    });

    it('uses default start/end dates when not provided', async () => {
      query
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [{}] });

      await adminService.getOrdersReport();

      expect(query).toHaveBeenNthCalledWith(
        1,
        expect.any(String),
        ['1970-01-01', expect.any(String)]
      );
      expect(query).toHaveBeenNthCalledWith(
        2,
        expect.any(String),
        ['1970-01-01', expect.any(String)]
      );
    });
  });

  describe('getInventoryReport', () => {
    it('returns inventory rows ordered by stock', async () => {
      const inventoryRows = [{ id: 1, stock: 2 }, { id: 2, stock: 10 }];
      query.mockResolvedValueOnce({ rows: inventoryRows });

      const result = await adminService.getInventoryReport();

      expect(query).toHaveBeenCalledWith(
        'SELECT id, name, sku, category, price, stock FROM products ORDER BY stock ASC'
      );
      expect(result).toEqual(inventoryRows);
    });
  });

  describe('getRevenueReport', () => {
    it('returns revenue rows for provided date range', async () => {
      const revenueRows = [{ date: '2024-01-01', order_count: '1', revenue: '50.00' }];
      query.mockResolvedValueOnce({ rows: revenueRows });

      const result = await adminService.getRevenueReport('2024-01-01', '2024-01-10');

      expect(query).toHaveBeenCalledWith(expect.any(String), ['2024-01-01', '2024-01-10']);
      expect(result).toEqual(revenueRows);
    });

    it('uses default dates when omitted', async () => {
      query.mockResolvedValueOnce({ rows: [] });

      await adminService.getRevenueReport();

      expect(query).toHaveBeenCalledWith(expect.any(String), ['1970-01-01', expect.any(String)]);
    });
  });

  describe('getUserActivity', () => {
    it('returns user activity rows', async () => {
      const activity = [{ id: 1, order_count: '2', total_spent: '120.00' }];
      query.mockResolvedValueOnce({ rows: activity });

      const result = await adminService.getUserActivity();

      expect(query).toHaveBeenCalledWith(expect.any(String));
      expect(result).toEqual(activity);
    });
  });
});
