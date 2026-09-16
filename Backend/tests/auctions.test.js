const request = require('supertest');
const { loadApp } = require('./testApp');

const validAuction = {
  title: 'Test Camera',
  description: 'A test auction item.',
  category: 'Photography',
  startingPrice: 100,
  minBidIncrement: 10,
  startTime: '2026-09-20T10:00:00.000Z',
  endTime: '2026-09-21T10:00:00.000Z',
  sellerId: 'u1',
};

describe('auction routes', () => {
  let app;

  beforeEach(() => {
    app = loadApp();
  });

  test('returns the auction list with the expected structure', async () => {
    const response = await request(app).get('/api/auctions');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body[0]).toEqual(expect.objectContaining({
      id: expect.any(String),
      title: expect.any(String),
      startingPrice: expect.any(Number),
      currentBid: expect.any(Number),
    }));
  });

  test('retrieves an existing auction', async () => {
    const response = await request(app).get('/api/auctions/a1');

    expect(response.status).toBe(200);
    expect(response.body).toEqual(expect.objectContaining({ id: 'a1' }));
  });

  test('returns 404 for a missing auction', async () => {
    const response = await request(app).get('/api/auctions/not-found');

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ message: 'Auction not found' });
  });

  test('allows a seller to create an auction', async () => {
    const response = await request(app).post('/api/auctions').send(validAuction);

    expect(response.status).toBe(201);
    expect(response.body).toEqual(expect.objectContaining({
      title: validAuction.title,
      sellerId: 'u1',
      currentBid: 100,
      status: 'active',
    }));
  });

  test('rejects a non-seller creating an auction', async () => {
    const response = await request(app)
      .post('/api/auctions')
      .send({ ...validAuction, sellerId: 'u2' });

    expect(response.status).toBe(403);
  });

  test('rejects missing auction fields', async () => {
    const response = await request(app)
      .post('/api/auctions')
      .send({ title: validAuction.title, sellerId: 'u1' });

    expect(response.status).toBe(400);
  });

  test.each([
    { startTime: 'invalid-date' },
    { endTime: '2026-09-19T10:00:00.000Z' },
    { startingPrice: 0 },
    { startingPrice: 'not-a-number' },
    { minBidIncrement: 0 },
  ])('rejects invalid auction data: %o', async (override) => {
    const response = await request(app)
      .post('/api/auctions')
      .send({ ...validAuction, ...override });

    expect(response.status).toBe(400);
  });
});
