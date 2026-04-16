const axios = require('axios');

const FEDEX_BASE_URL = process.env.FEDEX_API_URL || 'https://apis-sandbox.fedex.com';
const CLIENT_ID = process.env.FEDEX_CLIENT_ID || 'mock_client_id';
const CLIENT_SECRET = process.env.FEDEX_CLIENT_SECRET || 'mock_secret';

const fedexService = {
  async _getToken() {
    if (process.env.NODE_ENV === 'test' || !process.env.FEDEX_CLIENT_ID) {
      return 'mock_token';
    }
    const res = await axios.post(`${FEDEX_BASE_URL}/oauth/token`, null, {
      params: { grant_type: 'client_credentials', client_id: CLIENT_ID, client_secret: CLIENT_SECRET }
    });
    return res.data.access_token;
  },

  async getRates(fromAddress, toAddress, packages) {
    if (!process.env.FEDEX_CLIENT_ID) {
      return [
        { serviceCode: 'FEDEX_GROUND', serviceName: 'FedEx Ground', carrier: 'fedex', rate: 8.99, currency: 'USD', estimatedDays: 5 },
        { serviceCode: 'FEDEX_2_DAY', serviceName: 'FedEx 2Day', carrier: 'fedex', rate: 24.99, currency: 'USD', estimatedDays: 2 },
        { serviceCode: 'PRIORITY_OVERNIGHT', serviceName: 'FedEx Priority Overnight', carrier: 'fedex', rate: 49.99, currency: 'USD', estimatedDays: 1 }
      ];
    }

    const token = await this._getToken();
    const payload = {
      accountNumber: { value: process.env.FEDEX_ACCOUNT_NUMBER },
      requestedShipment: {
        shipper: { address: fromAddress },
        recipient: { address: toAddress },
        requestedPackageLineItems: packages.map(p => ({
          weight: { units: 'LB', value: p.weight },
          dimensions: { length: p.dimensions?.length || 1, width: p.dimensions?.width || 1, height: p.dimensions?.height || 1, units: 'IN' }
        }))
      }
    };
    const res = await axios.post(`${FEDEX_BASE_URL}/rate/v1/rates/quotes`, payload, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data.output?.rateReplyDetails?.map(r => ({
      serviceCode: r.serviceType,
      serviceName: r.serviceName,
      carrier: 'fedex',
      rate: r.ratedShipmentDetails?.[0]?.totalNetCharge || 0,
      currency: 'USD',
      estimatedDays: r.commit?.dateDetail?.dayOfWeek || null
    })) || [];
  },

  async createShipment(data) {
    if (!process.env.FEDEX_CLIENT_ID) {
      const trackingNumber = `FX${Date.now()}`;
      return { trackingNumber, labelUrl: `https://mock-labels.fedex.com/${trackingNumber}.pdf`, carrier: 'fedex' };
    }

    const token = await this._getToken();
    const payload = {
      labelResponseOptions: 'URL_ONLY',
      requestedShipment: {
        shipper: { contact: data.fromAddress, address: data.fromAddress },
        recipients: [{ contact: data.toAddress, address: data.toAddress }],
        serviceType: data.serviceCode,
        labelSpecification: { imageType: 'PDF', labelStockType: 'PAPER_85X11_TOP_HALF_LABEL' },
        requestedPackageLineItems: data.packages.map(p => ({
          weight: { units: 'LB', value: p.weight },
          dimensions: { length: p.dimensions?.length || 1, width: p.dimensions?.width || 1, height: p.dimensions?.height || 1, units: 'IN' }
        }))
      }
    };
    const res = await axios.post(`${FEDEX_BASE_URL}/ship/v1/shipments`, payload, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const output = res.data.output?.transactionShipments?.[0];
    return {
      trackingNumber: output?.masterTrackingNumber,
      labelUrl: output?.pieceResponses?.[0]?.packageDocuments?.[0]?.url,
      carrier: 'fedex'
    };
  },

  async track(trackingNumber) {
    if (!process.env.FEDEX_CLIENT_ID) {
      return [
        { status: 'in_transit', location: 'Memphis, TN', description: 'In transit', timestamp: new Date() },
        { status: 'picked_up', location: 'Origin', description: 'Picked up', timestamp: new Date(Date.now() - 86400000) }
      ];
    }
    const token = await this._getToken();
    const res = await axios.post(`${FEDEX_BASE_URL}/track/v1/trackingnumbers`, {
      trackingInfo: [{ trackingNumberInfo: { trackingNumber } }]
    }, { headers: { Authorization: `Bearer ${token}` } });
    const events = res.data.output?.completeTrackResults?.[0]?.trackResults?.[0]?.scanEvents || [];
    return events.map(e => ({
      status: e.eventType,
      location: e.scanLocation?.city,
      description: e.eventDescription,
      timestamp: e.date
    }));
  },

  async cancel(trackingNumber) {
    return { success: true, trackingNumber };
  }
};

module.exports = fedexService;
