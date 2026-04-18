const axios = require('axios');

const UPS_BASE_URL = process.env.UPS_API_URL || 'https://onlinetools.ups.com';

const upsService = {
  async getRates(fromAddress, toAddress, packages) {
    if (!process.env.UPS_ACCESS_KEY) {
      return [
        { serviceCode: '03', serviceName: 'UPS Ground', carrier: 'ups', rate: 9.49, currency: 'USD', estimatedDays: 5 },
        { serviceCode: '02', serviceName: 'UPS 2nd Day Air', carrier: 'ups', rate: 27.99, currency: 'USD', estimatedDays: 2 },
        { serviceCode: '01', serviceName: 'UPS Next Day Air', carrier: 'ups', rate: 54.99, currency: 'USD', estimatedDays: 1 }
      ];
    }

    const payload = {
      UPSSecurity: {
        UsernameToken: { Username: process.env.UPS_USERNAME, Password: process.env.UPS_PASSWORD },
        ServiceAccessToken: { AccessLicenseNumber: process.env.UPS_ACCESS_KEY }
      },
      RatingServiceSelectionRequest: {
        Request: { RequestAction: 'Rate', RequestOption: 'Shop' },
        Shipment: {
          Shipper: { Address: fromAddress },
          ShipTo: { Address: toAddress },
          Package: packages.map(p => ({
            PackagingType: { Code: '02' },
            PackageWeight: { Weight: String(p.weight), UnitOfMeasurement: { Code: 'LBS' } }
          }))
        }
      }
    };

    const res = await axios.post(`${UPS_BASE_URL}/ups.app/xml/Rate`, payload);
    const services = res.data.RatingServiceSelectionResponse?.RatedShipment || [];
    return (Array.isArray(services) ? services : [services]).map(s => ({
      serviceCode: s.Service?.Code,
      serviceName: `UPS Service ${s.Service?.Code}`,
      carrier: 'ups',
      rate: parseFloat(s.TotalCharges?.MonetaryValue || 0),
      currency: s.TotalCharges?.CurrencyCode || 'USD',
      estimatedDays: null
    }));
  },

  async createShipment(data) {
    if (!process.env.UPS_ACCESS_KEY) {
      const trackingNumber = `1Z${Date.now()}`;
      return { trackingNumber, labelUrl: `https://mock-labels.ups.com/${trackingNumber}.pdf`, carrier: 'ups' };
    }

    const payload = {
      UPSSecurity: {
        UsernameToken: { Username: process.env.UPS_USERNAME, Password: process.env.UPS_PASSWORD },
        ServiceAccessToken: { AccessLicenseNumber: process.env.UPS_ACCESS_KEY }
      },
      ShipmentRequest: {
        Shipment: {
          Shipper: { Address: data.fromAddress },
          ShipTo: { Address: data.toAddress },
          Service: { Code: data.serviceCode },
          Package: data.packages.map(p => ({
            PackagingType: { Code: '02' },
            PackageWeight: { Weight: String(p.weight), UnitOfMeasurement: { Code: 'LBS' } }
          }))
        },
        LabelSpecification: { LabelImageFormat: { Code: 'PDF' } }
      }
    };

    const res = await axios.post(`${UPS_BASE_URL}/ups.app/xml/Ship`, payload);
    const result = res.data.ShipmentResponse?.ShipmentResults;
    return {
      trackingNumber: result?.ShipmentIdentificationNumber,
      labelUrl: result?.PackageResults?.ShippingLabel?.GraphicImage,
      carrier: 'ups'
    };
  },

  async track(trackingNumber) {
    if (!process.env.UPS_ACCESS_KEY) {
      return [
        { status: 'in_transit', location: 'Louisville, KY', description: 'Package in transit', timestamp: new Date() },
        { status: 'picked_up', location: 'Origin', description: 'Shipment picked up', timestamp: new Date(Date.now() - 86400000) }
      ];
    }

    const payload = {
      UPSSecurity: {
        UsernameToken: { Username: process.env.UPS_USERNAME, Password: process.env.UPS_PASSWORD },
        ServiceAccessToken: { AccessLicenseNumber: process.env.UPS_ACCESS_KEY }
      },
      TrackRequest: {
        Request: { RequestAction: 'Track' },
        InquiryNumber: trackingNumber
      }
    };

    const res = await axios.post(`${UPS_BASE_URL}/ups.app/xml/Track`, payload);
    const activities = res.data.TrackResponse?.Shipment?.Package?.Activity || [];
    return (Array.isArray(activities) ? activities : [activities]).map(a => ({
      status: a.Status?.StatusType?.Description,
      location: `${a.ActivityLocation?.Address?.City || ''}`,
      description: a.Status?.StatusType?.Description,
      timestamp: `${a.Date} ${a.Time}`
    }));
  },

  async cancel(trackingNumber) {
    return { success: true, trackingNumber };
  }
};

module.exports = upsService;
