const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { logError } = require('./logger');
const { getMetrics, recordResponse } = require('./metrics');

const app = express();
const PORT = 5000;

app.use((req, res, next) => {
  res.locals.errorMessage = '';

  const originalJson = res.json.bind(res);
  res.json = (body) => {
    if (res.statusCode >= 400 && body && typeof body === 'object') {
      res.locals.errorMessage = body.message || body.error || 'Request failed.';
    }
    return originalJson(body);
  };

  res.once('finish', () => {
    const requestPath = req.originalUrl.split('?')[0];
    recordResponse(req.method, requestPath, res.statusCode);

    if (res.statusCode >= 400) {
      logError({
        method: req.method,
        path: requestPath,
        statusCode: res.statusCode,
        message: res.locals.errorMessage || 'Request failed.',
      });
    }
  });

  next();
});

app.use(cors());
app.use(express.json());

const dataDir = path.join(__dirname, '..', 'Frontend', 'src', 'data');

function readJson(fileName) {
  const contents = fs.readFileSync(path.join(dataDir, fileName), 'utf8').replace(/^\uFEFF/, '');
  return JSON.parse(contents);
}

const users = readJson('fakeUsers.json');
const auctions = readJson('auctions.json');
let bids = readJson('bids.json');

function getUserById(id) {
  return users.find((user) => user.id === id) || null;
}

function getAuctionById(id) {
  return auctions.find((auction) => auction.id === id) || null;
}

function createId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function sanitizeUser(user) {
  if (!user) return null;
  const { password, ...safeUser } = user;
  return safeUser;
}

app.get('/', (req, res) => {
  res.json({ message: 'Auction seller/bidder API is running' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Bidder backend running' });
});

app.get('/api/metrics', (req, res) => {
  res.json(getMetrics());
});

app.get('/api/users/demo', (req, res) => {
  res.json(users.map(sanitizeUser));
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  const user = users.find(
    (item) =>
      item.email.toLowerCase() === String(email).toLowerCase() &&
      item.password === String(password)
  );

  if (!user) {
    return res.status(401).json({ message: 'Invalid email or password.' });
  }

  return res.json({
    user: sanitizeUser(user),
    token: `demo-token-${user.id}`,
  });
});

app.get('/api/auctions', (req, res) => {
  const { category, sellerId } = req.query;

  let result = [...auctions];

  if (sellerId) {
    result = result.filter((auction) => auction.sellerId === sellerId);
  }

  if (category && category !== 'All') {
    result = result.filter((auction) => auction.category === category);
  }

  return res.json(result);
});

app.get('/api/sellers', (req, res) => {
  const sellers = users.filter((user) => user.role === 'seller').map(sanitizeUser);
  return res.json(sellers);
});

app.get('/api/sellers/:id/auctions', (req, res) => {
  const seller = getUserById(req.params.id);
  if (!seller || seller.role !== 'seller') {
    return res.status(404).json({ message: 'Seller not found' });
  }

  const sellerAuctions = auctions.filter((auction) => auction.sellerId === seller.id);
  return res.json(sellerAuctions);
});

app.post('/api/auctions', (req, res) => {
  const {
    title,
    description,
    category,
    startingPrice,
    minBidIncrement,
    startTime,
    endTime,
    sellerId,
  } = req.body || {};

  if (!title || !description || !category || !startingPrice || !minBidIncrement || !startTime || !endTime || !sellerId) {
    return res.status(400).json({ message: 'All auction fields are required.' });
  }

  const seller = getUserById(String(sellerId));
  if (!seller || seller.role !== 'seller') {
    return res.status(403).json({ message: 'Only sellers can create auctions.' });
  }

  const start = new Date(startTime);
  const end = new Date(endTime);

  if (!Number.isFinite(Number(startingPrice)) || !Number.isFinite(Number(minBidIncrement)) || Number(startingPrice) <= 0 || Number(minBidIncrement) <= 0 || Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) {
    return res.status(400).json({ message: 'Invalid auction dates or pricing.' });
  }

  const newAuction = {
    id: createId('a'),
    title: String(title),
    description: String(description),
    category: String(category),
    images: [
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=80',
    ],
    sellerId: String(sellerId),
    startingPrice: Number(startingPrice),
    currentBid: Number(startingPrice),
    minBidIncrement: Number(minBidIncrement),
    bidCount: 0,
    startTime: start.toISOString(),
    endTime: end.toISOString(),
    status: 'active',
  };

  auctions.unshift(newAuction);
  return res.status(201).json(newAuction);
});

app.get('/api/auctions/:id', (req, res) => {
  const auction = getAuctionById(req.params.id);

  if (!auction) {
    return res.status(404).json({ message: 'Auction not found' });
  }

  return res.json(auction);
});

app.get('/api/auctions/:id/bids', (req, res) => {
  const auctionId = req.params.id;

  const auctionBids = bids
    .filter((bid) => bid.auctionId === auctionId)
    .sort((a, b) => new Date(b.placedAt) - new Date(a.placedAt));

  return res.json(auctionBids);
});

app.post('/api/auctions/:id/bids', (req, res) => {
  const auctionId = req.params.id;
  const { bidderId, amount } = req.body || {};

  const auction = getAuctionById(auctionId);
  if (!auction) {
    return res.status(404).json({ message: 'Auction not found' });
  }

  const bidder = getUserById(String(bidderId));
  if (!bidder || bidder.role !== 'bidder') {
    return res.status(403).json({ message: 'Only bidders can place bids.' });
  }

  if (auction.status !== 'active') {
    return res.status(400).json({ message: 'This auction is not active.' });
  }

  const auctionBids = bids.filter((bid) => bid.auctionId === auctionId);
  const currentHighest = auctionBids.reduce((max, bid) => Math.max(max, Number(bid.amount)), Number(auction.startingPrice));
  const numericAmount = Number(amount);

  if (!Number.isFinite(numericAmount)) {
    return res.status(400).json({ message: 'Bid amount must be a valid number.' });
  }

  const minimumAllowed = currentHighest + Number(auction.minBidIncrement || 0);
  if (numericAmount < minimumAllowed) {
    return res.status(400).json({ message: `Bid must be at least $${minimumAllowed}.` });
  }

  const newBid = {
    id: createId('b'),
    auctionId,
    bidderId: bidder.id,
    bidderName: bidder.name,
    amount: numericAmount,
    placedAt: new Date().toISOString(),
  };

  bids.unshift(newBid);

  auction.currentBid = numericAmount;
  auction.bidCount = auctionBids.length + 1;

  return res.status(201).json(newBid);
});

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found.' });
});

app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  if (error instanceof SyntaxError && error.status === 400 && error.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Request body must contain valid JSON.' });
  }

  console.error(error);
  res.locals.errorMessage = error.message || 'An unexpected server error occurred.';
  return res.status(500).json({ message: 'An unexpected server error occurred.' });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Bidder backend running on http://localhost:${PORT}`);
  });
}

module.exports = app;
