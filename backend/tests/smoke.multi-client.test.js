'use strict';

const request = require('supertest');

jest.mock('../src/jobs/autoSyncJob', () => ({ start: jest.fn() }));
jest.mock('../src/jobs/reconciliationJob', () => ({ start: jest.fn() }));

const app = require('../src/app');

describe('Multi-client smoke tests', () => {
  it('GET /health is reachable for app clients', async () => {
    const res = await request(app).get('/health');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'OK');
  });

  it('sets CORS headers for Windows desktop origin', async () => {
    const res = await request(app)
      .options('/api/health')
      .set('Origin', 'app://local')
      .set('Access-Control-Request-Method', 'GET');

    expect(res.status).toBe(204);
    expect(res.headers['access-control-allow-origin']).toBe('app://local');
  });

  it('sets CORS headers for Android WebView origin', async () => {
    const res = await request(app)
      .options('/api/health')
      .set('Origin', 'capacitor://localhost')
      .set('Access-Control-Request-Method', 'GET');

    expect(res.status).toBe(204);
    expect(res.headers['access-control-allow-origin']).toBe('capacitor://localhost');
  });
});
