const axios = require('axios');

const DHL_BASE_URL = process.env.DHL_API_URL || 'https://api-mock.dhl.com/mydhlapi';

const dhlService = {
  _headers() {
    const key = process.env.DHL_API_KEY || 'mock_key';
    return {
      'DHL-API-Key': key,
      'Content-Type': 'application/json'
    };
  },

  async getRates(fromAddress, toAddress, packages) {
    if (!process.env.DHL_API_KEY) {
      return [
        { serviceCode: 'P', serviceName: 'DHL Express Worldwide', carrier: 'dhl', rate: 34.99, currency: 'USD', estimatedDays: 3 },
        { serviceCode: 'D', serviceName: 'DHL Express Easy', carrier: 'dhl', rate: 44.99, currency: 'USD', estimatedDays: 2 }
      ];
    }

    const params = {
      accountNumber: process.env.DHL_ACCOUNT_NUMBER,
      originCountryCode: fromAddress.countryCode,
      originPostalCode: fromAddress.postalCode,
      destinationCountryCode: toAddress.countryCode,
      destinationPostalCode: toAddress.postalCode,
      weight: packages.reduce((s, p) => s + (p.weight || 0), 0),
      length: packages[0]?.dimensions?.length || 1,
      width: packages[0]?.dimensions?.width || 1,
      height: packages[0]?.dimensions?.height || 1
    };

    const res = await axios.get(`${DHL_BASE_URL}/rates`, { params, headers: this._headers() });
    return (res.data.products || []).map(p => ({
      serviceCode: p.productCode,
      serviceName: p.productName,
      carrier: 'dhl',
      rate: p.totalPrice?.[0]?.price || 0,
      currency: p.totalPrice?.[0]?.priceCurrency || 'USD',
      estimatedDays: p.deliveryCapabilities?.estimatedDeliveryDateAndTime ? null : null
    }));
  },

  async createShipment(data) {
    if (!process.env.DHL_API_KEY) {
      const trackingNumber = `DHL${Date.now()}`;
      return { trackingNumber, labelUrl: `https://mock-labels.dhl.com/${trackingNumber}.pdf`, carrier: 'dhl' };
    }

    const payload = {
      plannedShippingDateAndTime: new Date().toISOString(),
      pickup: { isRequested: false },
      productCode: data.serviceCode,
      accounts: [{ typeCode: 'shipper', number: process.env.DHL_ACCOUNT_NUMBER }],
      shipper: {
        name: data.fromAddress.name || 'Shipper',
        postalAddress: {
          postalCode: data.fromAddress.postalCode,
          cityName: data.fromAddress.city,
          countryCode: data.fromAddress.countryCode
        }
      },
      recipient: {
        name: data.toAddress.name || 'Recipient',
        postalAddress: {
          postalCode: data.toAddress.postalCode,
          cityName: data.toAddress.city,
          countryCode: data.toAddress.countryCode
        }
      },
      packages: data.packages.map(p => ({
        weight: p.weight,
        dimensions: { length: p.dimensions?.length || 1, width: p.dimensions?.width || 1, height: p.dimensions?.height || 1 }
      }))
    };

    const res = await axios.post(`${DHL_BASE_URL}/shipments`, payload, { headers: this._headers() });
    return {
      trackingNumber: res.data.shipmentTrackingNumber,
      labelUrl: res.data.documents?.find(d => d.typeCode === 'label')?.content,
      carrier: 'dhl'
    };
  },

  async track(trackingNumber) {
    if (!process.env.DHL_API_KEY) {
      return [
        { status: 'in_transit', location: 'Frankfurt, DE', description: 'Shipment in transit', timestamp: new Date() },
        { status: 'picked_up', location: 'Origin', description: 'Shipment picked up', timestamp: new Date(Date.now() - 86400000) }
      ];
    }

    const res = await axios.get(`${DHL_BASE_URL}/shipments/${trackingNumber}/tracking`, {
      headers: this._headers()
    });
    const events = res.data.shipments?.[0]?.events || [];
    return events.map(e => ({
      status: e.typeCode,
      location: e.location?.address?.addressLocality,
      description: e.description,
      timestamp: e.timestamp
    }));
  },

  async cancel(trackingNumber) {
    return { success: true, trackingNumber };
  }
};

module.exports = dhlService;
