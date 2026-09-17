# Product API

Base URL: `/api/v1/products`

Products are seller-owned items that may later be registered in one auction. The authenticated seller ID always comes from the access token; clients must not send `seller_id`.

## Authentication

Protected endpoints require this header:

```http
Authorization: Bearer <access-token>
```

The token must belong to an active `SELLER` account. Public product detail does not require authentication.

## Response Format

Successful responses use:

```json
{
  "success": true,
  "message": "Optional success message",
  "data": {}
}
```

Errors from centralized handling use:

```json
{
  "success": false,
  "message": "Human-readable explanation",
  "code": "STABLE_ERROR_CODE"
}
```

Required-field errors also include `errors`:

```json
{
  "success": false,
  "message": "Required fields missing: title, images",
  "code": "VALIDATION_ERROR",
  "errors": [
    { "field": "title", "message": "This field is required" },
    { "field": "images", "message": "This field is required" }
  ]
}
```

## Product Object

```json
{
  "id": "c8b5b85c-ea8b-495b-b37c-6b15f5e9dfbc",
  "title": "Vintage camera",
  "description": "Fully working 35 mm camera.",
  "detailed_specs": { "brand": "Canon", "year": 1985 },
  "condition": "USED",
  "images": ["https://example.com/camera.jpg"],
  "created_at": "2026-09-17T10:00:00.000Z",
  "updated_at": "2026-09-17T10:00:00.000Z",
  "category": {
    "id": "fb8dfb14-5d21-4ce4-a15a-5fa2fb095526",
    "name": "Photography",
    "slug": "photography"
  },
  "seller": {
    "id": "e84f4728-bb09-482e-a5b1-09a7ba3622c3",
    "display_name": "Camera Seller"
  },
  "auction": null
}
```

`auction` is `null` until the product is registered. When registered, it contains the auction ID, status, start time, and end time.

## Endpoints

### Create Product

`POST /api/v1/products`

Access: active seller only.

Request body:

```json
{
  "title": "Vintage camera",
  "description": "Fully working 35 mm camera.",
  "detailed_specs": { "brand": "Canon", "year": 1985 },
  "category_id": "fb8dfb14-5d21-4ce4-a15a-5fa2fb095526",
  "condition": "USED",
  "images": ["https://example.com/camera.jpg"]
}
```

| Field | Required | Rules |
|---|---|---|
| `title` | Yes | Non-empty string; maximum 200 characters |
| `description` | No | Product description |
| `detailed_specs` | No | JSON object/array/value for item-specific details |
| `category_id` | Yes | Must reference an existing category UUID |
| `condition` | Yes | `NEW`, `USED`, or `REFURBISHED` |
| `images` | Yes | Non-empty JSON array |

Success: `201 Created`

```json
{
  "success": true,
  "message": "Product created successfully",
  "data": { "product": { "id": "...", "title": "Vintage camera" } }
}
```

Common failures:

| Situation | Status | Code | Response message |
|---|---:|---|---|
| No access token | 401 | Not centralized yet | `Authorization header missing` |
| Active bidder tries to create | 403 | `ROLE_FORBIDDEN` | `You are not allowed to perform this action` |
| Missing required fields | 400 | `VALIDATION_ERROR` | `Required field(s) missing: ...` |
| Blank or too-long title | 400 | `VALIDATION_ERROR` | `Title must be a non-empty string up to 200 characters` |
| Invalid condition | 400 | `VALIDATION_ERROR` | `Condition must be NEW, USED, or REFURBISHED` |
| Empty/non-array images | 400 | `VALIDATION_ERROR` | `Images must contain at least one image URL` |
| Unknown category | 404 | `CATEGORY_NOT_FOUND` | `Category was not found` |

Incorrect example:

```json
{
  "title": "",
  "category_id": "fb8dfb14-5d21-4ce4-a15a-5fa2fb095526",
  "condition": "OLD",
  "images": []
}
```

The first failed validation returns `400 VALIDATION_ERROR`; do not rely on multiple validation messages being returned together.

### Get My Products

`GET /api/v1/products/my-products`

Access: active seller only.

No request body or URL parameters.

Success: `200 OK`

```json
{
  "success": true,
  "data": {
    "products": [
      { "id": "...", "title": "Vintage camera", "auction": null }
    ]
  }
}
```

Products are returned newest first. The list is empty when the seller owns no products.

Failures: authentication and role failures are the same as Create Product.

### Get Product Detail

`GET /api/v1/products/:productId`

Access: public.

Example:

```http
GET /api/v1/products/c8b5b85c-ea8b-495b-b37c-6b15f5e9dfbc
```

Success: `200 OK`

```json
{
  "success": true,
  "data": { "product": { "id": "...", "title": "Vintage camera" } }
}
```

Failures:

| Situation | Status | Code | Response message |
|---|---:|---|---|
| Missing `productId` | 400 | `VALIDATION_ERROR` | `Required field missing: productId` |
| Product does not exist | 404 | `PRODUCT_NOT_FOUND` | `Product was not found` |

### Update Product

`PATCH /api/v1/products/:productId`

Access: active seller who owns the product.

Send at least one allowed field. Unrecognized fields, including `seller_id`, are ignored.

```json
{
  "title": "Vintage Canon camera",
  "condition": "REFURBISHED",
  "images": ["https://example.com/camera-front.jpg"]
}
```

Allowed fields: `title`, `description`, `detailed_specs`, `category_id`, `condition`, `images`.

Success: `200 OK`

```json
{
  "success": true,
  "message": "Product updated successfully",
  "data": { "product": { "id": "...", "title": "Vintage Canon camera" } }
}
```

Failures:

| Situation | Status | Code | Response message |
|---|---:|---|---|
| Seller does not own product, or product is missing | 404 | `RESOURCE_NOT_FOUND` | `Requested resource was not found` |
| No allowed update field supplied | 400 | `VALIDATION_ERROR` | `Provide at least one product field to update` |
| Invalid field value | 400 | `VALIDATION_ERROR` | See Create Product validation rules |
| Category does not exist | 404 | `CATEGORY_NOT_FOUND` | `Category was not found` |
| Product has an auction | 409 | `PRODUCT_REGISTERED_FOR_AUCTION` | `A product registered for auction cannot be changed` |

Incorrect example:

```json
{
  "condition": "DAMAGED"
}
```

Response:

```json
{
  "success": false,
  "message": "Condition must be NEW, USED, or REFURBISHED",
  "code": "VALIDATION_ERROR"
}
```

### Delete Product

`DELETE /api/v1/products/:productId`

Access: active seller who owns the product.

No request body.

Success: `200 OK`

```json
{
  "success": true,
  "message": "Product deleted successfully"
}
```

Failures:

| Situation | Status | Code | Response message |
|---|---:|---|---|
| Seller does not own product, or product is missing | 404 | `RESOURCE_NOT_FOUND` | `Requested resource was not found` |
| Product has an auction | 409 | `PRODUCT_REGISTERED_FOR_AUCTION` | `A product registered for auction cannot be changed` |

## File Responsibilities and Connections

### `product.routes.js`

Defines the HTTP endpoints and their middleware order.

```text
request
  -> verifyAccessTokenMiddleware (protected routes)
  -> requireRole('SELLER') (seller-only routes)
  -> validateRequest (required fields/parameters)
  -> loadOwnedResource (update/delete ownership lookup)
  -> product controller
```

`GET /:productId` is public and only validates the path parameter before reaching its controller.

### `product.controller.js`

Handles HTTP request/response formatting only. Every controller is wrapped by `asyncHandler`, which passes rejected async work to the global error handler. It calls product service functions and returns the standard JSON success envelope.

### `product.service.js`

Contains Product business rules:

- validates title, condition, images, and category existence;
- sets seller ownership from the authenticated user;
- prevents updates or deletion after auction registration;
- filters update data to permitted product fields;
- throws typed `AppError` instances for expected failures.

It calls the repository and never writes HTTP responses.

### `product.repository.js`

Contains only Prisma queries through `getPrismaClient()`:

- creates, reads, updates, and deletes products;
- checks category existence;
- returns a consistent product shape with category, seller, and optional auction data;
- orders a seller's products newest first.

### Shared Dependencies

| File | Used for Product APIs |
|---|---|
| `../auth/auth.middleware.js` | Verifies bearer access token and attaches `req.user` |
| `../middleware/requireRole.js` | Loads current account role and allows sellers only |
| `../middleware/validateRequest.js` | Rejects missing route and create-body fields |
| `../middleware/loadOwnedResource.js` | Finds a product only when it belongs to the current seller; attaches `req.product` |
| `../errors/asyncHandler.js` | Sends async errors to Express error middleware |
| `../errors/AppError.js` | Creates expected errors with HTTP status and stable code |
| `../errors/errorHandler.js` | Creates standard error JSON responses in `app.js` |
| `../config/supabase.js` | Supplies the initialized Prisma client |

## Current Limitations

- `images` is verified only as a non-empty array; URL format and maximum image count are not yet checked.
- `detailed_specs` accepts Prisma-compatible JSON without a strict schema.
- Product changes are blocked once any auction relation exists, including a future cancelled or unsold auction.
- `GET /api/products/:productId` returns product seller display information. Access restrictions for private seller inventory are not implemented.
