'use strict';

const stripeService = require('../services/stripeService');
const Payment = require('../models/Payment');
const Subscription = require('../models/Subscription');
const Tenant = require('../models/Tenant');

const stripeWebhook = {
  async handleWebhook(req, res) {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;
    try {
      event = stripeService.constructWebhookEvent(req.body, sig, webhookSecret);
    } catch (err) {
      console.error('[stripeWebhook] Signature verification failed:', err.message);
      return res.status(400).json({ error: `Webhook Error: ${err.message}` });
    }

    try {
      switch (event.type) {
        case 'payment_intent.succeeded':
          await stripeWebhook._handlePaymentSucceeded(event.data.object);
          break;

        case 'payment_intent.payment_failed':
          await stripeWebhook._handlePaymentFailed(event.data.object);
          break;

        case 'customer.subscription.updated':
          await stripeWebhook._handleSubscriptionUpdated(event.data.object);
          break;

        case 'customer.subscription.deleted':
          await stripeWebhook._handleSubscriptionDeleted(event.data.object);
          break;

        default:
          // Unhandled event type – acknowledge receipt
          break;
      }

      res.json({ received: true });
    } catch (err) {
      console.error('[stripeWebhook] Handler error:', err);
      res.status(500).json({ error: 'Webhook handler failed' });
    }
  },

  async _handlePaymentSucceeded(paymentIntent) {
    const { rows } = await _pool().query(
      'SELECT * FROM payments WHERE provider_payment_id = $1',
      [paymentIntent.id]
    );
    if (rows[0]) {
      await Payment.updateStatus(rows[0].id, 'succeeded');
    }
  },

  async _handlePaymentFailed(paymentIntent) {
    const { rows } = await _pool().query(
      'SELECT * FROM payments WHERE provider_payment_id = $1',
      [paymentIntent.id]
    );
    if (rows[0]) {
      await Payment.updateStatus(rows[0].id, 'failed');
    }
  },

  async _handleSubscriptionUpdated(subscription) {
    const existing = await Subscription.findByStripeId(subscription.id);
    if (existing) {
      await Subscription.update(existing.id, {
        status: subscription.status,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      });
    }
  },

  async _handleSubscriptionDeleted(subscription) {
    const existing = await Subscription.findByStripeId(subscription.id);
    if (existing) {
      await Subscription.update(existing.id, { status: 'cancelled' });
    }
  },
};

let _poolInstance = null;
function _pool() {
  if (!_poolInstance) {
    const { Pool } = require('pg');
    _poolInstance = new Pool({
      connectionString:
        process.env.DATABASE_URL ||
        `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT || 5432}/${process.env.DB_NAME}`,
    });
  }
  return _poolInstance;
}

module.exports = stripeWebhook;
