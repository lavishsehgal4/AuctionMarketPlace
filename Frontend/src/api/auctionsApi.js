// Auction-related data functions.
// Currently reads from: src/data/auctions.json
// When backend is ready: replace the imports below with real fetch() / axios calls.
// Used by: src/pages/AuctionListPage.jsx, src/pages/AuctionDetailPage.jsx, src/pages/CreateAuctionPage.jsx

import auctions from '../data/auctions.json';

export function getAuctions() {
  return Promise.resolve(auctions);
}

export function getAuctionById(id) {
  const auction = auctions.find((a) => a.id === id) || null;
  return Promise.resolve(auction);
}

export function createAuction(auctionData) {
  // No-op in MVP — would POST to backend later.
  return Promise.resolve({ ...auctionData, id: `a${Date.now()}` });
}
