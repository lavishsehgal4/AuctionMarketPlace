# data/

Dummy JSON files that stand in for a real backend during development.

- `auctions.json` — list of auction items (id, title, description, starting price, end time, etc.)
- `users.json`    — list of users (id, name, email, etc.)
- `bids.json`     — list of bids (id, auctionId, userId, amount, timestamp)

> Components must NEVER import these files directly.
> All reads go through `src/api/` so swapping to a real backend only requires changes there.
