# Auction API

Base URL: `/api/v1/auctions`

An auction registers one seller-owned product for bidding. The schema enforces one auction per product.

## Authentication

Seller-only endpoints require:

```http
Authorization: Bearer <access-token>
```

The token must belong to an active `SELLER` account. Listing and detail endpoints are public.

## Auction Object

```json
{
  "id": "a2e14248-efb0-45ee-97c4-047f9ad656dc",
  "starting_price": "100",
  "current_bid": "100",
  "min_bid_increment": "5",
  "start_time": "2026-10-01T10:00:00.000Z",
  "end_time": "2026-10-03T10:00:00.000Z",
  "status": "SCHEDULED",
  "product": { "id": "...", "title": "Vintage camera" },
  "seller": { "id": "...", "display_name": "Camera Seller" },
  "winner": null
}
```

Prisma returns decimal monetary fields as strings in JSON. This prevents floating-point precision loss.

## Error Format

```json
{
  "success": false,
  "message": "Human-readable explanation",
  "code": "STABLE_ERROR_CODE"
}
```

## Endpoints

### Register Auction

`POST /api/v1/auctions`

Access: active seller only.

```json
{
  "product_id": "c8b5b85c-ea8b-495b-b37c-6b15f5e9dfbc",
  "starting_price": 100,
  "min_bid_increment": 5,
  "start_time": "2026-10-01T10:00:00.000Z",
  "end_time": "2026-10-03T10:00:00.000Z"
}
```

| Field | Required | Rules |
|---|---|---|
| `product_id` | Yes | Must be owned by the authenticated seller and have no auction |
| `starting_price` | Yes | Positive number |
| `min_bid_increment` | Yes | Positive number |
| `start_time` | Yes | Valid ISO 8601 date |
| `end_time` | Yes | Valid ISO 8601 date after `start_time` |

Success: `201 Created`

```json
{
  "success": true,
  "message": "Auction registered successfully",
  "data": { "auction": { "id": "...", "status": "SCHEDULED" } }
}
```

Failures:

| Situation | Status | Code | Message |
|---|---:|---|---|
| Bidder account attempts registration | 403 | `ROLE_FORBIDDEN` | `You are not allowed to perform this action` |
| Required field missing | 400 | `VALIDATION_ERROR` | `Required field(s) missing: ...` |
| Price/increment is zero, negative, or not numeric | 400 | `VALIDATION_ERROR` | `<field> must be a positive number` |
| Date is invalid | 400 | `VALIDATION_ERROR` | `start_time and end_time must be valid ISO 8601 dates` |
| End is not after start | 400 | `VALIDATION_ERROR` | `end_time must be after start_time` |
| Product not owned or already registered | 409 | `PRODUCT_UNAVAILABLE` | `Product was not found or is already registered for auction` |

### List Open Auctions

`GET /api/v1/auctions`

Access: public.

Returns `SCHEDULED` and `ACTIVE` auctions ordered by earliest start time. It does not expose cancelled, ended, or unsold history.

Success: `200 OK`

```json
{
  "success": true,
  "data": { "auctions": [{ "id": "...", "status": "SCHEDULED" }] }
}
```

### Get Seller Auction History

`GET /api/v1/auctions/my-auctions`

Access: active seller only.

Returns all auctions owned by the seller, newest first. This includes `SCHEDULED`, `ACTIVE`, `ENDED`, `UNSOLD`, and `CANCELLED` records.

Success: `200 OK`

```json
{
  "success": true,
  "data": { "auctions": [{ "id": "...", "status": "ENDED" }] }
}
```

### Get Auction Detail

`GET /api/v1/auctions/:auctionId`

Access: public.

Success: `200 OK`

```json
{
  "success": true,
  "data": { "auction": { "id": "...", "product": {}, "seller": {}, "winner": null } }
}
```

Failure when the auction does not exist:

```json
{
  "success": false,
  "message": "Auction was not found",
  "code": "AUCTION_NOT_FOUND"
}
```

Status: `404 Not Found`.

### Cancel Auction

`POST /api/v1/auctions/:auctionId/cancel`

Access: active seller who owns the auction.

No request body is required.

The seller can cancel only while the auction has `SCHEDULED` status and the current time is before `start_time`.

Success: `200 OK`

```json
{
  "success": true,
  "message": "Auction cancelled successfully",
  "data": { "auction": { "id": "...", "status": "CANCELLED" } }
}
```

Failures:

| Situation | Status | Code | Message |
|---|---:|---|---|
| Auction does not exist or belongs to another seller | 404 | `AUCTION_NOT_FOUND` | `Auction was not found` |
| Auction is active, ended, cancelled, unsold, or has reached start time | 409 | `AUCTION_CANNOT_BE_CANCELLED` | `Auction can only be cancelled before its start time` |

## Module Flow

```text
auction.routes.js
  -> auth middleware and requireRole for seller-only routes
  -> validateRequest for required request data
  -> auction.controller.js
  -> auction.service.js
  -> auction.repository.js
  -> Prisma Auction and Product models
```

- `auction.routes.js` defines version-independent route paths; `app.js` mounts them at `/api/v1/auctions`.
- `auction.controller.js` formats success responses and delegates rejected async work to the shared error handler.
- `auction.service.js` enforces prices, auction dates, seller product ownership, the one-auction rule, and cancellation timing.
- `auction.repository.js` contains Prisma queries and the shared auction response selection.

## Current Boundary

Bidding, auction completion, winner assignment, and the `ACTIVE`/`ENDED`/`UNSOLD` status transitions are not implemented yet. They are the next Bid module and scheduled-completion work.
