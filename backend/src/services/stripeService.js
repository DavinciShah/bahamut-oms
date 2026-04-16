'use strict';

let _stripe = null;

function getStripe() {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY environment variable is not set');
    }
    const Stripe = require('stripe');
    _stripe = Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' });
  }
  return _stripe;
}

const stripeService = {
  async createPaymentIntent(amount, currency = 'usd', metadata = {}) {
    const stripe = getStripe();
    const intent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: currency.toLowerCase(),
      metadata,
    });
    return intent;
  },

  async createCustomer(email, name) {
    const stripe = getStripe();
    const customer = await stripe.customers.create({ email, name });
    return customer;
  },

  async createSubscription(customerId, priceId, options = {}) {
    const stripe = getStripe();
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      ...options,
    });
    return subscription;
  },

  async cancelSubscription(subscriptionId) {
    const stripe = getStripe();
    const cancelled = await stripe.subscriptions.cancel(subscriptionId);
    return cancelled;
  },

  async createRefund(paymentIntentId, amount) {
    const stripe = getStripe();
    const params = { payment_intent: paymentIntentId };
    if (amount !== undefined) params.amount = Math.round(amount * 100);
    return stripe.refunds.create(params);
  },

  constructWebhookEvent(payload, sig, secret) {
    const stripe = getStripe();
    return stripe.webhooks.constructEvent(payload, sig, secret);
  },
};

module.exports = stripeService;
