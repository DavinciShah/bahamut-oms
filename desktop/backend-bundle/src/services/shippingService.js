const fedexService = require('./fedexService');
const upsService = require('./upsService');
const dhlService = require('./dhlService');
const Shipment = require('../models/Shipment');
const TrackingEvent = require('../models/TrackingEvent');

const CARRIERS = { fedex: fedexService, ups: upsService, dhl: dhlService };

const shippingService = {
  async getRates(fromAddress, toAddress, packages) {
    const results = await Promise.allSettled([
      fedexService.getRates(fromAddress, toAddress, packages).then(r => ({ carrier: 'fedex', rates: r })),
      upsService.getRates(fromAddress, toAddress, packages).then(r => ({ carrier: 'ups', rates: r })),
      dhlService.getRates(fromAddress, toAddress, packages).then(r => ({ carrier: 'dhl', rates: r }))
    ]);

    return results
      .filter(r => r.status === 'fulfilled')
      .map(r => r.value)
      .flat();
  },

  async createShipment(tenantId, orderId, carrier, serviceCode, addresses, packages) {
    const carrierService = CARRIERS[carrier.toLowerCase()];
    if (!carrierService) throw new Error(`Unsupported carrier: ${carrier}`);

    const shipmentData = await carrierService.createShipment({
      serviceCode,
      fromAddress: addresses.from,
      toAddress: addresses.to,
      packages
    });

    const shipment = await Shipment.create({
      tenant_id: tenantId,
      order_id: orderId,
      carrier: carrier.toLowerCase(),
      tracking_number: shipmentData.trackingNumber,
      status: 'created',
      from_address: addresses.from,
      to_address: addresses.to,
      weight: packages[0]?.weight || 0,
      dimensions: packages[0]?.dimensions || {},
      label_url: shipmentData.labelUrl
    });

    await TrackingEvent.create({
      shipment_id: shipment.id,
      status: 'created',
      location: addresses.from.city,
      description: 'Shipment created',
      timestamp: new Date()
    });

    return shipment;
  },

  async getShipments(tenantId, options = {}) {
    return Shipment.findByTenant(tenantId, options);
  },

  async cancelShipment(shipmentId) {
    const shipment = await Shipment.findById(shipmentId);
    if (!shipment) throw new Error('Shipment not found');

    const carrierService = CARRIERS[shipment.carrier];
    if (carrierService) {
      try {
        await carrierService.cancel(shipment.tracking_number);
      } catch (err) {
        console.warn('Carrier cancel failed:', err.message);
      }
    }

    await TrackingEvent.create({
      shipment_id: shipmentId,
      status: 'cancelled',
      location: '',
      description: 'Shipment cancelled',
      timestamp: new Date()
    });

    return Shipment.cancel(shipmentId);
  },

  async getTrackingEvents(trackingNumber, carrier) {
    const carrierService = CARRIERS[carrier?.toLowerCase()];
    if (!carrierService) throw new Error(`Unsupported carrier: ${carrier}`);
    return carrierService.track(trackingNumber);
  }
};

module.exports = shippingService;
