const request = require('supertest');
const { loadApp } = require('./testApp');

describe('error handling', () => {
  let app;

  beforeEach(() => {
    app = loadApp();
  });

  test('returns a JSON 404 for an unknown route', async () => {
    const response = await request(app).get('/api/unknown-route');

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ message: 'Route not found.' });
  });

  test('returns a JSON 400 for malformed JSON', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .set('Content-Type', 'application/json')
      .send('{"email":');

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ message: 'Request body must contain valid JSON.' });
  });
});
