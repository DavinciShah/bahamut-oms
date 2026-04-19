const adminService = require('../services/adminService');

const getStats = async (req, res, next) => {
  try {
    const stats = await adminService.getStats();
    res.status(200).json({ success: true, data: { stats } });
  } catch (err) {
    next(err);
  }
};

const getOrdersReport = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const report = await adminService.getOrdersReport(startDate, endDate);
    res.status(200).json({ success: true, data: { report } });
  } catch (err) {
    next(err);
  }
};

const getInventoryReport = async (req, res, next) => {
  try {
    const inventory = await adminService.getInventoryReport();
    res.status(200).json({ success: true, data: { inventory } });
  } catch (err) {
    next(err);
  }
};

const getRevenueReport = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const revenue = await adminService.getRevenueReport(startDate, endDate);
    res.status(200).json({ success: true, data: { revenue } });
  } catch (err) {
    next(err);
  }
};

const getUserActivity = async (req, res, next) => {
  try {
    const activity = await adminService.getUserActivity();
    res.status(200).json({ success: true, data: { activity } });
  } catch (err) {
    next(err);
  }
};

module.exports = { getStats, getOrdersReport, getInventoryReport, getRevenueReport, getUserActivity };
