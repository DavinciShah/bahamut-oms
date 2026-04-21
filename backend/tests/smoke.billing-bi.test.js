'use strict';

const request = require('supertest');
const jwt = require('jsonwebtoken');

jest.mock('../src/jobs/autoSyncJob', () => ({ start: jest.fn() }));
jest.mock('../src/jobs/reconciliationJob', () => ({ start: jest.fn() }));

jest.mock('pg', () => {
  const query = jest.fn(async (sql) => {
    if (/information_schema\.columns/i.test(sql)) {
      return { rows: [{ '?column?': 1 }], rowCount: 1 };
    }

    if (/FROM\s+subscriptions/i.test(sql)) {
      return { rows: [], rowCount: 0 };
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
