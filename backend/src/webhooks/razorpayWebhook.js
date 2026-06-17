'use strict';

const razorpayService = require('../services/razorpayService');
const { query } = require('../config/database');
const Payment = require('../models/Payment');
const Subscription = require('../models/Subscription');

const razorpayWebhook = {
  async handleWebhook(req, res) {
    const signature = req.headers['x-razorpay-signature'];
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!signature || !webhookSecret) {
      console.error('[razorpayWebhook] Signature or webhook secret missing');
      return res.status(400).json({ error: 'Webhook Secret or Signature missing' });
    }

    const rawBody = req.body;
    const payloadString = Buffer.isBuffer(rawBody) ? rawBody.toString('utf8') : JSON.stringify(rawBody);

    const isVerified = razorpayService.verifyWebhookSignature(payloadString, signature, webhookSecret);
    if (!isVerified) {
      console.error('[razorpayWebhook] Signature verification failed');
      return res.status(400).json({ error: 'Signature verification failed' });
    }

    let eventData;
    try {
      eventData = JSON.parse(payloadString);
    } catch (err) {
      console.error('[razorpayWebhook] Payload parsing failed:', err.message);
      return res.status(400).json({ error: 'Invalid JSON payload' });
    }

    try {
      const eventType = eventData.event;
      const payload = eventData.payload;

      console.log(`[razorpayWebhook] Received event: ${eventType}`);

      switch (eventType) {
        case 'payment.captured':
          await razorpayWebhook._handlePaymentCaptured(payload.payment.entity);
          break;

        case 'payment.failed':
          await razorpayWebhook._handlePaymentFailed(payload.payment.entity);
          break;

        case 'subscription.charged':
          await razorpayWebhook._handleSubscriptionCharged(payload.subscription.entity, payload.payment?.entity);
          break;

        case 'subscription.cancelled':
          await razorpayWebhook._handleSubscriptionCancelled(payload.subscription.entity);
          break;

        default:
          break;
      }

      res.json({ received: true });
    } catch (err) {
      console.error('[razorpayWebhook] Handler error:', err);
      res.status(500).json({ error: 'Webhook handler failed' });
    }
  },

  async _handlePaymentCaptured(paymentEntity) {
    const providerPaymentId = paymentEntity.id;
    const orderId = paymentEntity.order_id;

    // Find payment in local database
    const { rows } = await query(
      'SELECT * FROM payments WHERE provider_payment_id = $1 OR metadata->>\'razorpay_order_id\' = $2',
      [providerPaymentId, orderId]
    );

    if (rows[0]) {
      await Payment.updateStatus(rows[0].id, 'succeeded');
      
      // If it was a subscription update, make sure the subscription is active
      const metadata = rows[0].metadata || {};
      if (metadata.planId && rows[0].tenant_id) {
        const subRows = await Subscription.findByTenant(rows[0].tenant_id);
        const existingSub = subRows[0];
        const now = new Date();
        const nextMonth = new Date(now);
        nextMonth.setMonth(nextMonth.getMonth() + 1);

        if (existingSub) {
          await Subscription.update(existingSub.id, {
            plan: metadata.planId,
            status: 'active',
            currentPeriodStart: now,
            currentPeriodEnd: nextMonth,
            razorpayPaymentId: providerPaymentId,
            razorpayOrderId: orderId
          });
        } else {
          await Subscription.create({
            tenantId: rows[0].tenant_id,
            plan: metadata.planId,
            status: 'active',
            razorpayPaymentId: providerPaymentId,
            razorpayOrderId: orderId,
            currentPeriodStart: now,
            currentPeriodEnd: nextMonth
          });
        }
      }
    }
  },

  async _handlePaymentFailed(paymentEntity) {
    const providerPaymentId = paymentEntity.id;
    const orderId = paymentEntity.order_id;

    const { rows } = await query(
      'SELECT * FROM payments WHERE provider_payment_id = $1 OR metadata->>\'razorpay_order_id\' = $2',
      [providerPaymentId, orderId]
    );
    if (rows[0]) {
      await Payment.updateStatus(rows[0].id, 'failed');
    }
  },

  async _handleSubscriptionCharged(subscriptionEntity, paymentEntity) {
    const subId = subscriptionEntity.id;
    const existing = await Subscription.findByRazorpaySubId(subId);
    if (existing) {
      const start = new Date(subscriptionEntity.current_start * 1000);
      const end = new Date(subscriptionEntity.current_end * 1000);
      await Subscription.update(existing.id, {
        status: 'active',
        currentPeriodStart: start,
        currentPeriodEnd: end,
        razorpayPaymentId: paymentEntity?.id || null
      });
    }
  },

  async _handleSubscriptionCancelled(subscriptionEntity) {
    const subId = subscriptionEntity.id;
    const existing = await Subscription.findByRazorpaySubId(subId);
    if (existing) {
      await Subscription.update(existing.id, { status: 'cancelled' });
    }
  }
};

module.exports = razorpayWebhook;
