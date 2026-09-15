// Bid-related data functions (placing a bid, fetching bids for an auction).
// Currently reads from: src/data/bids.json
// When backend is ready: replace the imports below with real fetch() / axios calls.
// Used by: src/pages/AuctionDetailPage.jsx, src/components/BidForm.jsx

import bids from '../data/bids.json';

export function getBidsByAuctionId(auctionId) {
  const result = bids.filter((b) => b.auctionId === auctionId);
  return Promise.resolve(result);
}

export function placeBid(auctionId, amount) {
  // No-op in MVP — would POST to backend later.
  return Promise.resolve({ auctionId, amount, placedAt: new Date().toISOString() });
}
