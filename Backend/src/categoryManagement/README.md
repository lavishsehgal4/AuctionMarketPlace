# Category Management APIs

This module handles all category-related operations for the Auction MarketPlace.

---

## Overview

- **POST /api/categories/add** - Add multiple categories to the marketplace
- **GET /api/categories** - Fetch all available categories

---

## API Endpoints

### 1. Add Categories

**Endpoint:** `POST /api/categories/add`

**Description:** Add multiple product categories to the marketplace database.

**Request Body:**

```json
{
  "categories": [
    {
      "name": "Electronics",
      "slug": "electronics",
      "display_order": 1,
      "commission_rate": 5.5,
      "image_url": "https://example.com/electronics.jpg"
    },
    {
      "name": "Fashion",
      "slug": "fashion",
      "display_order": 2,
      "commission_rate": 8.0,
      "image_url": "https://example.com/fashion.jpg"
    }
  ]
}
```

**Request Body Schema:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| categories | Array | Yes | Array of category objects |
| categories[].name | String | Yes | Category name (max 100 chars) |
| categories[].slug | String | Yes | URL-friendly slug, must be unique (max 100 chars) |
| categories[].display_order | Number | Yes | Order to display categories (integer) |
| categories[].commission_rate | Number | Yes | Marketplace commission rate (0-100, decimal) |
| categories[].image_url | String | No | Category image URL (max 500 chars) |

**Success Response (201):**

```json
{
  "success": true,
  "message": "2 categories added successfully",
  "data": {
    "count": 2
  }
}
```

**Error Response (400):**

```json
{
  "success": false,
  "message": "Category 0: name is required and must be a string"
}
```

**Error Response (409 - Duplicate Slug):**

```json
{
  "success": false,
  "message": "One or more category slugs already exist"
}
```

**Error Response (500):**

```json
{
  "success": false,
  "message": "Failed to add categories"
}
```

**Validation Rules:**

- `name`: Required, string, max 100 characters
- `slug`: Required, string, must be unique, max 100 characters
- `display_order`: Required, positive integer
- `commission_rate`: Required, number between 0-100
- `image_url`: Optional, max 500 characters
- Categories array: Must not be empty

---

### 2. Get All Categories

**Endpoint:** `GET /api/categories`

**Description:** Fetch all available product categories. Does NOT include commission_rate for security.

**Request Parameters:** None

**Success Response (200):**

```json
{
  "success": true,
  "message": "Categories fetched successfully",
  "data": {
    "categories": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "name": "Electronics",
        "slug": "electronics",
        "display_order": 1,
        "image_url": "https://example.com/electronics.jpg"
      },
      {
        "id": "550e8400-e29b-41d4-a716-446655440001",
        "name": "Fashion",
        "slug": "fashion",
        "display_order": 2,
        "image_url": "https://example.com/fashion.jpg"
      }
    ]
  }
}
```

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| id | String (UUID) | Unique category identifier |
| name | String | Category name |
| slug | String | URL-friendly slug |
| display_order | Number | Order for display (sorted ascending) |
| image_url | String | Category image URL (nullable) |

**Note:** `commission_rate` is intentionally excluded from the response for security/privacy reasons.

**Error Response (500):**

```json
{
  "success": false,
  "message": "Failed to fetch categories"
}
```

---

## File Structure

```
src/categoryManagement/
├── category.controller.js      # Request/response handling
├── category.service.js         # Business logic and validation
├── category.repository.js      # Database operations
├── category.routes.js          # Route definitions
└── README.md                   # This file
```

---

## Layer Responsibilities

### Controller (category.controller.js)
- Validates HTTP request format
- Calls appropriate service method
- Handles error responses
- Returns formatted JSON responses

### Service (category.service.js)
- Business logic and validation
- Data transformation
- Calls repository methods
- Throws descriptive errors

### Repository (category.repository.js)
- Direct database operations using Prisma
- Executes queries and mutations
- Handles database errors
- Returns raw data from DB

### Routes (category.routes.js)
- Defines API endpoints
- Maps routes to controllers
- Exported router for app.js integration

---

## Usage Examples

### cURL - Add Categories

```bash
curl -X POST http://localhost:3000/api/categories/add \
  -H "Content-Type: application/json" \
  -d '{
    "categories": [
      {
        "name": "Electronics",
        "slug": "electronics",
        "display_order": 1,
        "commission_rate": 5.5,
        "image_url": "https://example.com/electronics.jpg"
      }
    ]
  }'
```

### cURL - Get All Categories

```bash
curl -X GET http://localhost:3000/api/categories \
  -H "Content-Type: application/json"
```

### JavaScript/Fetch - Add Categories

```javascript
fetch('http://localhost:3000/api/categories/add', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    categories: [
      {
        name: 'Electronics',
        slug: 'electronics',
        display_order: 1,
        commission_rate: 5.5,
        image_url: 'https://example.com/electronics.jpg'
      }
    ]
  })
})
.then(r => r.json())
.then(d => console.log(d))
```

### JavaScript/Fetch - Get Categories

```javascript
fetch('http://localhost:3000/api/categories')
  .then(r => r.json())
  .then(d => console.log(d.data.categories))
```

---

## Status Codes

| Code | Meaning |
|------|---------|
| 201 | Categories created successfully |
| 200 | Categories fetched successfully |
| 400 | Invalid input/validation error |
| 409 | Conflict (duplicate slug) |
| 500 | Server error |

---

## Notes

- Categories are ordered by `display_order` (ascending) in responses
- Commission rates are never returned in GET requests (internal use only)
- Slug must be unique; duplicates will be skipped with `skipDuplicates: true`
- All timestamps use ISO 8601 format
- Database connection uses Supabase PostgreSQL via Prisma

---

## Future Enhancements

- Update/edit categories endpoint
- Delete category endpoint (with safeguards)
- Category search/filter functionality
- Category image upload integration
- Pagination support for large category lists
- Category statistics/analytics

