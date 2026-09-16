const request = require('supertest');
const { loadApp } = require('./testApp');

describe('metrics endpoint', () => {
  let app;

  beforeEach(() => {
    app = loadApp();
  });

  test('tracks successful requests and exposes the metrics structure', async () => {
    await request(app).get('/api/health');
    const response = await request(app).get('/api/metrics');

    expect(response.status).toBe(200);
    expect(response.body).toEqual(expect.objectContaining({
      totalRequests: 1,
      successfulRequests: 1,
      totalErrors: 0,
      errorsByStatus: {},
      errorsByEndpoint: {},
    }));
  });

  test('counts failed requests once by status and endpoint', async () => {
    const failedResponse = await request(app).get('/api/does-not-exist');
    const metricsResponse = await request(app).get('/api/metrics');

    expect(failedResponse.status).toBe(404);
    expect(metricsResponse.body).toEqual(expect.objectContaining({
      totalRequests: 1,
      successfulRequests: 0,
      totalErrors: 1,
      errorsByStatus: { 404: 1 },
      errorsByEndpoint: { 'GET /api/does-not-exist': 1 },
    }));
  });
});
