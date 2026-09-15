# Data Contract — Auction Marketplace

> Frontend talks to `src/api/*.js` only. When a real backend exists, only those 3 files change.

---

## Data Models

### User
| Field    | Type   | Notes                     |
|----------|--------|---------------------------|
| id       | string | e.g. `"u1"`               |
| name     | string | Display name              |
| email    | string | Login identifier          |
| role     | string | `"seller"` or `"bidder"`  |

### Auction
| Field            | Type     | Notes                                      |
|------------------|----------|--------------------------------------------|
| id               | string   | e.g. `"a1"`                                |
| title            | string   | Max 120 chars                              |
| description      | string   |                                            |
| category         | string   | Photography / Furniture / Books / Music / Watches / Art / Other |
| images           | string[] | Array of image URLs                        |
| sellerId         | string   | Ref to User.id                             |
| startingPrice    | number   | USD, must be > 0                           |
| currentBid       | number   | Starts equal to startingPrice              |
| minBidIncrement  | number   | Next bid must be ≥ currentBid + this value |
| bidCount         | number   |                                            |
| startTime        | string   | ISO 8601 UTC                               |
| endTime          | string   | ISO 8601 UTC                               |
| status           | string   | `"active"` / `"ended"` / `"cancelled"`     |

### Bid
| Field       | Type   | Notes                          |
|-------------|--------|--------------------------------|
| id          | string | e.g. `"b1"`                    |
| auctionId   | string | Ref to Auction.id              |
| bidderId    | string | Ref to User.id                 |
| bidderName  | string | Denormalized for display       |
| amount      | number | Must be ≥ currentBid + minBidIncrement |
| placedAt    | string | ISO 8601 UTC                   |

---

## API Endpoints Needed

### Auth
| Method | Endpoint       | Used by         | Notes                        |
|--------|----------------|-----------------|------------------------------|
| POST   | /auth/login    | LoginPage       | Body: `{email, password}` → returns `{token, user}` |
| POST   | /auth/logout   | Navbar          | Invalidates token            |

### Auctions
| Method | Endpoint         | Used by              | Notes                      |
|--------|------------------|----------------------|----------------------------|
| GET    | /auctions        | AuctionListPage      | Returns all active auctions |
| GET    | /auctions/:id    | AuctionDetailPage    | Returns one auction        |
| POST   | /auctions        | CreateAuctionPage    | Seller only. Body: title, description, category, images, startingPrice, minBidIncrement, startTime, endTime |

### Bids
| Method | Endpoint               | Used by           | Notes                      |
|--------|------------------------|-------------------|----------------------------|
| GET    | /auctions/:id/bids     | AuctionDetailPage | Returns bids newest first  |
| POST   | /auctions/:id/bids     | BidForm           | Bidder only. Body: `{amount}` |

---

## Who Uses What

```
LoginPage          → usersApi     → POST /auth/login
AuctionListPage    → auctionsApi  → GET  /auctions
AuctionDetailPage  → auctionsApi  → GET  /auctions/:id
                   → bidsApi      → GET  /auctions/:id/bids
CreateAuctionPage  → auctionsApi  → POST /auctions
BidForm            → bidsApi      → POST /auctions/:id/bids
```

---

## Notes

- Passwords are never returned by the backend — `fakeUsers.json` is MVP only.
- After a successful bid, frontend re-fetches the auction to update `currentBid` and `bidCount`.
- All errors return `{ "error": "message" }` with an appropriate HTTP status code.
