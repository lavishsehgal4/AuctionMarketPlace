const request = require('supertest');
const { loadApp } = require('./testApp');

describe('bid routes', () => {
  let app;

  beforeEach(() => {
    app = loadApp();
  });

  test('places a valid bid for a bidder', async () => {
    const response = await request(app)
      .post('/api/auctions/a1/bids')
      .send({ bidderId: 'u2', amount: 1300 });

    expect(response.status).toBe(201);
    expect(response.body).toEqual(expect.objectContaining({
      auctionId: 'a1',
      bidderId: 'u2',
      amount: 1300,
      bidderName: expect.any(String),
    }));
  });

  test('rejects a non-bidder placing a bid', async () => {
    const response = await request(app)
      .post('/api/auctions/a1/bids')
      .send({ bidderId: 'u1', amount: 1300 });

    expect(response.status).toBe(403);
  });

  test('returns 404 for a bid on a missing auction', async () => {
    const response = await request(app)
      .post('/api/auctions/not-found/bids')
      .send({ bidderId: 'u2', amount: 1300 });

    expect(response.status).toBe(404);
  });

  test.each([
    { amount: 1200 },
    { amount: 'not-a-number' },
  ])('rejects an invalid bid amount: %o', async (body) => {
    const response = await request(app)
      .post('/api/auctions/a1/bids')
      .send({ bidderId: 'u2', ...body });

    expect(response.status).toBe(400);
  });

  test('rejects a bid on an inactive auction', async () => {
    const inactiveApp = loadApp({ inactiveAuction: true });
    const response = await request(inactiveApp)
      .post('/api/auctions/a1/bids')
      .send({ bidderId: 'u2', amount: 1300 });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ message: 'This auction is not active.' });
  });
});
