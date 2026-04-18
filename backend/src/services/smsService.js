'use strict';

let twilioClient = null;

function getClient() {
  if (!twilioClient) {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    if (!accountSid || !authToken) {
      throw new Error('Twilio credentials not configured');
    }
    const twilio = require('twilio');
    twilioClient = twilio(accountSid, authToken);
  }
  return twilioClient;
}

const smsService = {
  async sendSMS(to, message) {
    if (!process.env.TWILIO_ACCOUNT_SID) {
      console.warn('[smsService] Twilio not configured – skipping SMS to', to);
      return { skipped: true };
    }
    try {
      const client = getClient();
      const result = await client.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to,
      });
      return { sid: result.sid, status: result.status };
    } catch (err) {
      console.error('[smsService] Failed to send SMS:', err.message);
      throw err;
    }
  },

  async sendOrderUpdate(phone, order) {
    const message =
      `[Bahamut OMS] Order #${order.id} update: status is now "${order.status}". ` +
      `Total: ${order.total}. Thank you for your business.`;
    return this.sendSMS(phone, message);
  },
};

module.exports = smsService;
