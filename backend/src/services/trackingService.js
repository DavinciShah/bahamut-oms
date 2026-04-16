const Shipment = require('../models/Shipment');
const TrackingEvent = require('../models/TrackingEvent');
const fedexService = require('./fedexService');
const upsService = require('./upsService');
const dhlService = require('./dhlService');

const CARRIERS = { fedex: fedexService, ups: upsService, dhl: dhlService };

const trackingService = {
  async getTracking(trackingNumber, carrier) {
    const shipment = await Shipment.findByTrackingNumber(trackingNumber);
    const stored = shipment ? await TrackingEvent.findByShipment(shipment.id) : [];

    const carrierKey = (carrier || shipment?.carrier || '').toLowerCase();
    const carrierService = CARRIERS[carrierKey];
    let liveEvents = [];

    if (carrierService) {
      try {
        liveEvents = await carrierService.track(trackingNumber);
      } catch (err) {
        console.warn(`[TrackingService] Live tracking failed for ${trackingNumber}:`, err.message);
      }
    }

    return {
      trackingNumber,
      carrier: carrierKey,
      shipment: shipment || null,
      events: liveEvents.length ? liveEvents : stored
    };
  },

  async updateTrackingStatus(shipmentId) {
    const shipment = await Shipment.findById(shipmentId);
    if (!shipment) throw new Error('Shipment not found');

    const carrierService = CARRIERS[shipment.carrier];
    if (!carrierService) return shipment;

    const events = await carrierService.track(shipment.tracking_number);
    if (!events.length) return shipment;

    for (const event of events) {
      try {
        await TrackingEvent.create({
          shipment_id: shipmentId,
          status: event.status,
          location: event.location || '',
          description: event.description || '',
          timestamp: event.timestamp || new Date()
        });
      } catch (err) {
        // Skip duplicate events
      }
    }

    const latestStatus = events[0]?.status;
    if (latestStatus) {
      const statusMap = {
        'delivered': 'delivered',
        'out_for_delivery': 'out_for_delivery',
        'in_transit': 'in_transit',
        'exception': 'exception'
      };
      const newStatus = statusMap[latestStatus.toLowerCase()] || shipment.status;
      if (newStatus !== shipment.status) {
        return Shipment.updateStatus(shipmentId, newStatus);
      }
    }

    return shipment;
  },

  async getAllActiveShipments() {
    return Shipment.findActive();
  }
};

module.exports = trackingService;
