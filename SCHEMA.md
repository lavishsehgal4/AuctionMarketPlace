# Auction Marketplace Schema

## Scope

The database supports separate seller and bidder accounts, seller-owned products, one auction per product, and persistent bid history.

Prisma schema source: `Backend/prisma/schema.prisma`.

## Entity Relationship

```text
User (SELLER) 1 --- * Product
User (SELLER) 1 --- * Auction
Product        1 --- 0..1 Auction
Auction        1 --- * Bid
User (BIDDER)  1 --- * Bid
User (BIDDER)  1 --- * Auction (won auctions)
Category       1 --- * Product
User           1 --- * RefreshToken
```

## Tables

### User

Stores authentication, profile, account status, KYC status, and account type.

| Field | Purpose |
|---|---|
| `id` | UUID primary key |
| `email` | Unique sign-in identifier |
| `account_type` | `SELLER` or `BIDDER` |
| `account_status` | `ACTIVE`, `SUSPENDED`, or `BANNED` |
| `kyc_status` | Identity verification state |

Relations:

- A seller owns `products` and creates `seller_auctions`.
- A bidder creates `placed_bids` and may appear in `won_auctions`.
- The current system treats seller and bidder accounts as separate roles.

### RefreshToken

Stores hashed refresh tokens for user sessions. A user can have multiple active sessions.

### Category

Classifies products and stores category-specific marketplace commission settings. One category can contain many products.

### Product

Stores an item the seller wishes to offer for auction.

| Field | Purpose |
|---|---|
| `seller_id` | Owner of the product |
| `title`, `description` | Listing content |
| `detailed_specs` | Flexible product-specific data |
| `category_id` | Product category |
| `condition` | `NEW`, `USED`, or `REFURBISHED` |
| `images` | Product image URLs/data |

A product has an optional `auction` relation. `Auction.product_id` is unique, which makes the relationship one-to-one: one product may be unregistered or registered in exactly one auction.

### Auction

Stores the schedule, price state, status, and result for a seller's registered product auction.

| Field | Purpose |
|---|---|
| `product_id` | Unique product reference; enforces one auction per product |
| `seller_id` | Seller that registered the auction |
| `starting_price` | Lowest permitted first bid |
| `current_bid` | Current highest bid; initialize to `starting_price` |
| `min_bid_increment` | Required increase after an existing bid |
| `start_time`, `end_time` | Auction schedule |
| `status` | Auction lifecycle state |
| `winner_id` | Bidder that wins an ended auction; `null` when unsold |

Auction statuses:

| Status | Meaning |
|---|---|
| `SCHEDULED` | Created but not yet open for bidding |
| `ACTIVE` | Open for eligible bidders |
| `ENDED` | Finished with a winning bidder |
| `UNSOLD` | Finished without any bid |
| `CANCELLED` | Cancelled by its seller before start time |

### Bid

Stores every successful bid permanently. It is the source of truth for bidder and auction bid history.

| Field | Purpose |
|---|---|
| `auction_id` | Auction room being bid on |
| `bidder_id` | Bidder who placed the bid |
| `amount` | Bid amount |
| `placed_at` | Time the bid was accepted |

The latest bid made by a bidder for a particular auction is the `Bid` with the greatest `placed_at` for that `auction_id` and `bidder_id`. The current leading price for everyone is stored separately in `Auction.current_bid` for fast reads.

## History Queries Supported

### Seller History

Query `User.seller_auctions`, including `product`, `bids`, and `winner`. This supports views such as active auctions, completed auctions, cancelled auctions, final price, and winner.

### Bidder History

Query `User.placed_bids`, including each `auction`, its `product`, and its `winner`. Group bids by `auction_id` to show one auction-room history per bidder. A bidder won when the ended auction's `winner_id` equals their user ID.

## Authorization and Lifecycle Rules

These are enforced in controllers/services and transactions, not by Prisma fields alone.

| Action | Required account | Rule |
|---|---|---|
| Create product | `SELLER` | Seller becomes `Product.seller_id` |
| Register auction | `SELLER` | Product must belong to authenticated seller and not already have an auction |
| Cancel auction | `SELLER` | Seller must own it and current time must be before `start_time` |
| Enter auction room | Authenticated user | Viewing is allowed; bidding remains role-restricted |
| Place bid | `BIDDER` | Auction must be `ACTIVE`, bidder cannot own the auction, and time must be before `end_time` |
| First bid | `BIDDER` | Amount must be at least `starting_price` |
| Later bid | `BIDDER` | Amount must be at least `current_bid + min_bid_increment` |
| Finish auction | System job/service | At `end_time`, mark `ENDED` and set winner if bids exist; otherwise mark `UNSOLD` |

Placing a bid must be a single database transaction: create the `Bid`, update `Auction.current_bid`, and update any count derived for display. This avoids two simultaneous bidders both being accepted against an old price.

## Indexes and Benefits

| Index / constraint | Benefit |
|---|---|
| `Auction.product_id @unique` | Enforces one product per auction |
| `Auction(seller_id)` | Fast seller auction-history pages |
| `Auction(winner_id)` | Fast winner history pages |
| `Auction(status, start_time)` | Efficient scheduled/active discovery |
| `Auction(status, end_time)` | Efficient auction-closing job queries |
| `Bid(auction_id, placed_at)` | Efficient bid-room history and latest bid retrieval |
| `Bid(bidder_id, auction_id, placed_at)` | Efficient bidder history and latest bid per auction |

## Deliberate V1 Boundaries

- No relisting: a product can only have one auction. Relisting later requires either a new product record or changing the unique constraint to one-to-many.
- No bid withdrawal or editing: accepted bids stay immutable.
- No payment, order, shipping, reserve price, buy-now price, or real-time socket event models yet.
- `current_bid` is cached auction state; the bid table remains the audit history.
