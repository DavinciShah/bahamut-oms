const express = require('express');
const router = express.Router();
const Shipment = require('../models/Shipment');
const TrackingEvent = require('../models/TrackingEvent');

router.post('/fedex', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const event = JSON.parse(req.body);
    const { trackingNumber, status, timestamp, location, description } = event;

    const shipment = await Shipment.findByTrackingNumber(trackingNumber);
    if (shipment) {
      await TrackingEvent.create({
        shipment_id: shipment.id,
        status,
        location: location || '',
        description: description || '',
        timestamp: timestamp || new Date()
      });
      if (['delivered', 'exception', 'out_for_delivery'].includes(status)) {
        await Shipment.updateStatus(shipment.id, status);
      }
    }
    res.sendStatus(200);
  } catch (err) {
    console.error('[ShippingWebhook/FedEx]', err);
    res.sendStatus(500);
  }
});

router.post('/ups', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const event = JSON.parse(req.body);
    const { trackingNumber, status, timestamp, location } = event;

    const shipment = await Shipment.findByTrackingNumber(trackingNumber);
    if (shipment) {
      await TrackingEvent.create({
        shipment_id: shipment.id,
        status,
        location: location || '',
        description: status,
        timestamp: timestamp || new Date()
      });
      if (status === 'D') {
        await Shipment.updateStatus(shipment.id, 'delivered');
      }
    }
    res.sendStatus(200);
  } catch (err) {
    console.error('[ShippingWebhook/UPS]', err);
    res.sendStatus(500);
  }
});

router.post('/dhl', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const event = JSON.parse(req.body);
    const { shipmentTrackingNumber, events } = event;

    const shipment = await Shipment.findByTrackingNumber(shipmentTrackingNumber);
    if (shipment && Array.isArray(events)) {
      for (const e of events) {
        await TrackingEvent.create({
          shipment_id: shipment.id,
          status: e.typeCode || 'update',
          location: e.location?.address?.addressLocality || '',
          description: e.description || '',
          timestamp: e.timestamp || new Date()
        });
      }
      const latestEvent = events[0];
      if (latestEvent?.typeCode === 'OK') {
        await Shipment.updateStatus(shipment.id, 'delivered');
      }
    }
    res.sendStatus(200);
  } catch (err) {
    console.error('[ShippingWebhook/DHL]', err);
    res.sendStatus(500);
  }
});

module.exports = router;
