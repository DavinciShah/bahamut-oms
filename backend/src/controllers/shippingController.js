const shippingService = require('../services/shippingService');
const trackingService = require('../services/trackingService');
const Shipment = require('../models/Shipment');
const TrackingEvent = require('../models/TrackingEvent');

const shippingController = {
  async getRates(req, res) {
    try {
      const { fromAddress, toAddress, packages } = req.body;
      if (!fromAddress || !toAddress || !packages) {
        return res.status(400).json({ error: 'fromAddress, toAddress, and packages are required' });
      }
      const rates = await shippingService.getRates(fromAddress, toAddress, packages);
      res.json(rates);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  },

  async createShipment(req, res) {
    try {
      const tenantId = req.user.tenant_id;
      const { orderId, carrier, serviceCode, addresses, packages } = req.body;
      if (!carrier || !serviceCode || !addresses) {
        return res.status(400).json({ error: 'carrier, serviceCode, and addresses are required' });
      }
      const shipment = await shippingService.createShipment(tenantId, orderId, carrier, serviceCode, addresses, packages || [{ weight: 1 }]);
      res.status(201).json(shipment);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  },

  async getShipments(req, res) {
    try {
      const tenantId = req.user.tenant_id;
      const { status, limit, offset } = req.query;
      const shipments = await shippingService.getShipments(tenantId, {
        status,
        limit: limit ? parseInt(limit) : undefined,
        offset: offset ? parseInt(offset) : undefined
      });
      res.json(shipments);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  },

  async getShipment(req, res) {
    try {
      const shipment = await Shipment.findById(req.params.id);
      if (!shipment) return res.status(404).json({ error: 'Shipment not found' });
      const events = await TrackingEvent.findByShipment(shipment.id);
      res.json({ ...shipment, tracking_events: events });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  },

  async cancelShipment(req, res) {
    try {
      const shipment = await shippingService.cancelShipment(req.params.id);
      res.json(shipment);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  },

  async getTracking(req, res) {
    try {
      const { trackingNumber } = req.params;
      const { carrier } = req.query;
      const data = await trackingService.getTracking(trackingNumber, carrier);
      res.json(data);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  }
};

module.exports = shippingController;
