'use strict';

const request = require('supertest');
const jwt = require('jsonwebtoken');

jest.mock('../src/jobs/autoSyncJob', () => ({ start: jest.fn() }));
jest.mock('../src/jobs/reconciliationJob', () => ({ start: jest.fn() }));
jest.mock('../src/services/stripeService', () => ({
  createPaymentIntent: jest.fn(async (amount, currency) => ({
    id: 'pi_test_123',
    client_secret: 'pi_test_123_secret',
    amount: Math.round(Number(amount) * 100),
    currency: (currency || 'usd').toLowerCase(),
    status: 'requires_payment_method',
  })),
}));

jest.mock('pg', () => {
  let subscriptionRow = null;
  const query = jest.fn(async (sql, params = []) => {
    if (/information_schema\.columns/i.test(sql)) {
      return { rows: [{ '?column?': 1 }], rowCount: 1 };
    }

    if (/INSERT\s+INTO\s+subscriptions/i.test(sql)) {
      subscriptionRow = {
        id: 1,
        tenant_id: params[0],
        plan: params[1],
        status: params[2],
        stripe_subscription_id: params[3] || null,
        current_period_start: params[4] || null,
        current_period_end: params[5] || null,
        created_at: new Date().toISOString(),
      };
      return { rows: [subscriptionRow], rowCount: 1 };
    }

    if (/UPDATE\s+subscriptions/i.test(sql) && subscriptionRow) {
      if (/plan\s*=\s*\$/i.test(sql)) {
        subscriptionRow.plan = params[0];
      }
      if (/status\s*=\s*\$/i.test(sql)) {
        subscriptionRow.status = params[subscriptionRow.plan === params[0] ? 1 : 0] || params[0];
      }
      const maybeDateStart = params.find((value) => value instanceof Date);
      if (maybeDateStart) {
        subscriptionRow.current_period_start = params.find((value) => value instanceof Date) || subscriptionRow.current_period_start;
      }
      if (params.some((value) => value instanceof Date)) {
        const dates = params.filter((value) => value instanceof Date);
        subscriptionRow.current_period_end = dates[dates.length - 1];
      }
      return { rows: [subscriptionRow], rowCount: 1 };
    }

    if (/FROM\s+subscriptions/i.test(sql)) {
      return { rows: subscriptionRow ? [subscriptionRow] : [], rowCount: subscriptionRow ? 1 : 0 };
    }

    if (/FROM\s+invoices\s+WHERE\s+id\s*=\s*\$1/i.test(sql)) {
      return {
        rows: [{ id: params[0], total: '149.97', status: 'paid', created_at: new Date('2026-04-10T00:00:00Z') }],
        rowCount: 1,
      };
    }

    if (/FROM\s+orders/i.test(sql) && /DATE_TRUNC\('month'/i.test(sql)) {
      return {
        rows: [
          { month: new Date('2026-01-01T00:00:00Z'), revenue: '1000.00' },
          { month: new Date('2026-02-01T00:00:00Z'), revenue: '1200.00' },
        ],
        rowCount: 2,
      };
    }

    if (/FROM\s+orders/i.test(sql) && /DATE_TRUNC\('day'/i.test(sql)) {
      return {
        rows: [
          { day: new Date('2026-04-01T00:00:00Z'), revenue: '100.00' },
          { day: new Date('2026-04-02T00:00:00Z'), revenue: '110.00' },
          { day: new Date('2026-04-03T00:00:00Z'), revenue: '105.00' },
          { day: new Date('2026-04-04T00:00:00Z'), revenue: '95.00' },
          { day: new Date('2026-04-05T00:00:00Z'), revenue: '120.00' },
          { day: new Date('2026-04-06T00:00:00Z'), revenue: '115.00' },
          { day: new Date('2026-04-07T00:00:00Z'), revenue: '108.00' },
        ],
        rowCount: 7,
      };
    }

    if (/FROM\s+users\s+u/i.test(sql)) {
      return {
        rows: [
          {
            id: 2,
            name: 'Test User',
            email: 'test@example.com',
            last_order_date: new Date('2026-03-01T00:00:00Z'),
            order_count: '4',
            lifetime_value: '420.00',
            days_since_last_order: '30',
          },
        ],
        rowCount: 1,
      };
    }

    return { rows: [], rowCount: 0 };
  });

  const Pool = jest.fn(() => ({
    query,
    connect: jest.fn().mockResolvedValue({ query, release: jest.fn() }),
    on: jest.fn(),
  }));

  return { Pool };
});

const app = require('../src/app');

function authToken(payload = {}) {
  return jwt.sign(
    {
      id: payload.id || 1,
      email: payload.email || 'admin@example.com',
      role: payload.role || 'admin',
      tenant_id: payload.tenant_id || 1,
    },
    process.env.JWT_SECRET || 'secret',
    { expiresIn: '1h' }
  );
}

describe('Billing and BI smoke tests', () => {
  it('GET /api/payments/subscription returns subscription payload (route-order regression guard)', async () => {
    const res = await request(app)
      .get('/api/payments/subscription')
      .set('Authorization', `Bearer ${authToken()}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status');
    expect(res.body).toHaveProperty('plan_name');
  });

  it('GET /api/payments/abc is rejected as invalid payment id', async () => {
    const res = await request(app)
      .get('/api/payments/abc')
      .set('Authorization', `Bearer ${authToken()}`);

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/invalid payment id/i);
  });

  it('GET /api/payments/plans, /invoices, /history are reachable', async () => {
    const token = authToken();
    const [plans, invoices, history] = await Promise.all([
      request(app).get('/api/payments/plans').set('Authorization', `Bearer ${token}`),
      request(app).get('/api/payments/invoices').set('Authorization', `Bearer ${token}`),
      request(app).get('/api/payments/history').set('Authorization', `Bearer ${token}`),
    ]);

    expect(plans.status).toBe(200);
    expect(Array.isArray(plans.body)).toBe(true);
    expect(invoices.status).toBe(200);
    expect(Array.isArray(invoices.body)).toBe(true);
    expect(history.status).toBe(200);
    expect(Array.isArray(history.body)).toBe(true);
  });

  it('supports frontend billing mutation endpoints for intent and subscription management', async () => {
    const token = authToken();
    const [intent, update, cancel] = await Promise.all([
      request(app)
        .post('/api/payments/intent')
        .set('Authorization', `Bearer ${token}`)
        .send({ amount: 25, currency: 'USD' }),
      request(app)
        .put('/api/payments/subscription')
        .set('Authorization', `Bearer ${token}`)
        .send({ planId: 'standard' }),
      request(app)
        .post('/api/payments/subscription/cancel')
        .set('Authorization', `Bearer ${token}`),
    ]);

    expect(intent.status).toBe(201);
    expect(intent.body).toHaveProperty('id');
    expect(intent.body).toHaveProperty('client_secret');

    expect(update.status).toBe(200);
    expect(update.body).toHaveProperty('plan_id');

    expect(cancel.status).toBe(200);
    expect(cancel.body).toHaveProperty('status');
  });

  it('GET /api/payments/invoices/:id returns invoice payload', async () => {
    const token = authToken();
    const res = await request(app)
      .get('/api/payments/invoices/7')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id', 7);
  });

  it('GET /api/bi/dashboard and prediction/anomaly endpoints return 200', async () => {
    const token = authToken();
    const [dashboard, revenue, churn, anomalies] = await Promise.all([
      request(app).get('/api/bi/dashboard').set('Authorization', `Bearer ${token}`),
      request(app).get('/api/bi/predictions/revenue?months=6').set('Authorization', `Bearer ${token}`),
      request(app).get('/api/bi/predictions/churn').set('Authorization', `Bearer ${token}`),
      request(app).get('/api/bi/anomalies').set('Authorization', `Bearer ${token}`),
    ]);

    expect(dashboard.status).toBe(200);
    expect(dashboard.body).toHaveProperty('anomaly_alerts');

    expect(revenue.status).toBe(200);
    expect(revenue.body).toHaveProperty('predictions');

    expect(churn.status).toBe(200);
    expect(Array.isArray(churn.body)).toBe(true);

    expect(anomalies.status).toBe(200);
    expect(anomalies.body).toHaveProperty('total_alerts');
  });
});
