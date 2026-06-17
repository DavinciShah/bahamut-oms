'use strict';

let _razorpay = null;

function getRazorpay() {
  if (!_razorpay) {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      throw new Error('RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET environment variables are not set');
    }
    const Razorpay = require('razorpay');
    _razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
  return _razorpay;
}

const razorpayService = {
  async createOrder(amount, currency = 'INR', receipt = '') {
    const razorpay = getRazorpay();
    const options = {
      amount: Math.round(amount * 100), // amount in paisa (e.g. 100 paise = 1 INR)
      currency: currency.toUpperCase(),
      receipt: receipt || `receipt_${Date.now()}`,
    };
    return razorpay.orders.create(options);
  },

  verifyPaymentSignature(orderId, paymentId, signature) {
    const crypto = require('crypto');
    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      throw new Error('RAZORPAY_KEY_SECRET is not set');
    }
    const generated_signature = crypto
      .createHmac('sha256', secret)
      .update(orderId + '|' + paymentId)
      .digest('hex');

    return generated_signature === signature;
  },

  verifyWebhookSignature(payload, signature, webhookSecret) {
    const crypto = require('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(payload)
      .digest('hex');
    return expectedSignature === signature;
  }
};

module.exports = razorpayService;
