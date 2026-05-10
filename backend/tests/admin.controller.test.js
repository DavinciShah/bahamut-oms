'use strict';

jest.mock('../src/services/adminService', () => ({
  getStats: jest.fn(),
  getOrdersReport: jest.fn(),
  getInventoryReport: jest.fn(),
  getRevenueReport: jest.fn(),
  getUserActivity: jest.fn()
}));

const adminService = require('../src/services/adminService');
const adminController = require('../src/controllers/adminController');

const createRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('adminController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('success paths', () => {
    it('getStats responds with stats payload', async () => {
      const req = { query: {} };
      const res = createRes();
      const next = jest.fn();
      const stats = { totalUsers: 1 };
      adminService.getStats.mockResolvedValueOnce(stats);

      await adminController.getStats(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: { stats } });
      expect(next).not.toHaveBeenCalled();
    });

    it('getOrdersReport passes dates and responds with report payload', async () => {
      const req = { query: { startDate: '2024-01-01', endDate: '2024-01-31' } };
      const res = createRes();
      const next = jest.fn();
      const report = { orders: [], summary: {} };
      adminService.getOrdersReport.mockResolvedValueOnce(report);

      await adminController.getOrdersReport(req, res, next);

      expect(adminService.getOrdersReport).toHaveBeenCalledWith('2024-01-01', '2024-01-31');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: { report } });
      expect(next).not.toHaveBeenCalled();
    });

    it('getInventoryReport responds with inventory payload', async () => {
      const req = { query: {} };
      const res = createRes();
      const next = jest.fn();
      const inventory = [{ id: 1 }];
      adminService.getInventoryReport.mockResolvedValueOnce(inventory);

      await adminController.getInventoryReport(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: { inventory } });
      expect(next).not.toHaveBeenCalled();
    });

    it('getRevenueReport passes dates and responds with revenue payload', async () => {
      const req = { query: { startDate: '2024-02-01', endDate: '2024-02-29' } };
      const res = createRes();
      const next = jest.fn();
      const revenue = [{ date: '2024-02-01', revenue: 10 }];
      adminService.getRevenueReport.mockResolvedValueOnce(revenue);

      await adminController.getRevenueReport(req, res, next);

      expect(adminService.getRevenueReport).toHaveBeenCalledWith('2024-02-01', '2024-02-29');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: { revenue } });
      expect(next).not.toHaveBeenCalled();
    });

    it('getUserActivity responds with activity payload', async () => {
      const req = { query: {} };
      const res = createRes();
      const next = jest.fn();
      const activity = [{ id: 1, total_spent: 100 }];
      adminService.getUserActivity.mockResolvedValueOnce(activity);

      await adminController.getUserActivity(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: { activity } });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('error paths', () => {
    it('forwards getStats errors to next', async () => {
      const req = { query: {} };
      const res = createRes();
      const next = jest.fn();
      const error = new Error('stats failed');
      adminService.getStats.mockRejectedValueOnce(error);

      await adminController.getStats(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });

    it('forwards getOrdersReport errors to next', async () => {
      const req = { query: { startDate: '2024-01-01', endDate: '2024-01-31' } };
      const res = createRes();
      const next = jest.fn();
      const error = new Error('orders report failed');
      adminService.getOrdersReport.mockRejectedValueOnce(error);

      await adminController.getOrdersReport(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });

    it('forwards getInventoryReport errors to next', async () => {
      const req = { query: {} };
      const res = createRes();
      const next = jest.fn();
      const error = new Error('inventory failed');
      adminService.getInventoryReport.mockRejectedValueOnce(error);

      await adminController.getInventoryReport(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });

    it('forwards getRevenueReport errors to next', async () => {
      const req = { query: { startDate: '2024-02-01', endDate: '2024-02-29' } };
      const res = createRes();
      const next = jest.fn();
      const error = new Error('revenue failed');
      adminService.getRevenueReport.mockRejectedValueOnce(error);

      await adminController.getRevenueReport(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });

    it('forwards getUserActivity errors to next', async () => {
      const req = { query: {} };
      const res = createRes();
      const next = jest.fn();
      const error = new Error('activity failed');
      adminService.getUserActivity.mockRejectedValueOnce(error);

      await adminController.getUserActivity(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
