# Frontend Source Structure

## Folder Layout

```
src/
├── data/          # Dummy JSON files — stand-in for a real backend
├── api/           # All data-fetching logic lives here, nowhere else
├── components/    # Small, reusable UI pieces (no pages, no routing)
├── pages/         # Full page views, one file per screen
├── utils/         # Shared utility functions (time formatting, etc.)
├── App.jsx        # Root component — sets up routing and fake-auth state
└── main.jsx       # Entry point — mounts App into the DOM
```

---

## What Each Folder Is For

### data/
Raw dummy data in JSON format. Think of it as a fake database.
- `auctions.json`   — auction listings (id, title, description, category, images, sellerId,
                       startingPrice, currentBid, minBidIncrement, bidCount, startTime, endTime, status)
- `bids.json`       — bids placed on auctions (id, auctionId, bidderId, bidderName, amount, placedAt)
- `users.json`      — placeholder user accounts (unused in MVP flow)
- `fakeUsers.json`  — demo accounts for fake login (id, name, email, password, role: "bidder"|"seller")

Rule: nothing imports from here except files in `api/`.

### api/
Functions that load or send data. Right now they read from `data/`.
When a real backend exists, you only change these files — everything
else in the project stays the same.
- `auctionsApi.js` — getAuctions(), getAuctionById(id), createAuction(data)
- `bidsApi.js`     — getBidsByAuctionId(auctionId), placeBid(auctionId, amount)
- `usersApi.js`    — getFakeUsers(), findUserByCredentials(email, password)

Rule: pages and components import from here, never from `data/` directly.

### components/
Small, focused UI pieces that don't represent a whole screen.
- `Navbar.jsx`       — top nav bar; receives currentUser + onLogout as props
- `AuctionCard.jsx`  — one auction displayed as a card; used by AuctionListPage
- `BidForm.jsx`      — bid input + submit button (no-op in MVP); used by AuctionDetailPage
- `BidHistory.jsx`   — list of bids on an auction; receives bids array as props

Rule: components receive data as props and do not fetch anything themselves,
except BidForm which calls bidsApi on submit (no-op in this phase).

### pages/
One file per screen. Pages fetch their own data via api/ and pass it to components.
- `LoginPage.jsx`         — fake login; reads fakeUsers via usersApi, routes by role
- `AuctionListPage.jsx`   — bidder home: grid of AuctionCards from auctionsApi
- `AuctionDetailPage.jsx` — full auction view: description + BidForm + BidHistory
- `CreateAuctionPage.jsx` — seller form to list an auction; createAuction is no-op in MVP

### utils/
Pure helper functions with no side effects.
- `time.js` — formatTimeLeft(isoString), formatDateTime(isoString)

---

## Fake Login & Role Routing

`src/data/fakeUsers.json` holds three demo accounts:

| Name          | Email           | Password    | Role   |
|---------------|-----------------|-------------|--------|
| Alice Chen    | alice@demo.com  | seller123   | seller |
| Bob Martinez  | bob@demo.com    | bidder123   | bidder |
| Sara Kim      | sara@demo.com   | bidder456   | bidder |

After login, `App.jsx` routes:
- **seller** → `/seller` (CreateAuctionPage)
- **bidder** → `/auctions` (AuctionListPage)

No real auth, no session persistence — role lives in React state only.

---

## Data Flow

```
src/data/auctions.json
        ↓  (imported here only)
src/api/auctionsApi.js   ← exports getAuctions(), getAuctionById()
        ↓  (called here)
src/pages/AuctionListPage.jsx   ← calls getAuctions(), stores in state
        ↓  (passed as props)
src/components/AuctionCard.jsx  ← receives one auction object, renders it
```

When we add a real backend:
- Only files in `src/api/` change (swap JSON import for fetch/axios calls).
- Pages and components are untouched.

---

## Naming Conventions

| Thing          | Convention          | Example                  |
|----------------|---------------------|--------------------------|
| Pages          | PascalCase + "Page" | AuctionDetailPage.jsx    |
| Components     | PascalCase          | AuctionCard.jsx          |
| CSS Modules    | Same name + .module | AuctionCard.module.css   |
| API files      | camelCase + "Api"   | auctionsApi.js           |
| JSON data      | lowercase plural    | auctions.json            |
| Utilities      | camelCase           | time.js                  |
