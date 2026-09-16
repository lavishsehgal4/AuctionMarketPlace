const request = require('supertest');
const { loadApp } = require('./testApp');

describe('authentication routes', () => {
  let app;

  beforeEach(() => {
    app = loadApp();
  });

  test('logs in with valid credentials and omits the password', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'alice@demo.com', password: 'seller123' });

    expect(response.status).toBe(200);
    expect(response.body.user).toMatchObject({ id: 'u1', role: 'seller' });
    expect(response.body.user).not.toHaveProperty('password');
    expect(response.body.token).toBe('demo-token-u1');
  });

  test.each([
    [{ email: 'alice@demo.com', password: 'wrong' }],
    [{ email: 'missing@demo.com', password: 'seller123' }],
  ])('rejects invalid credentials with 401', async (credentials) => {
    const response = await request(app).post('/api/auth/login').send(credentials);

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ message: 'Invalid email or password.' });
  });

  test('rejects missing email or password with 400', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'alice@demo.com' });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ message: 'Email and password are required.' });
  });
});
