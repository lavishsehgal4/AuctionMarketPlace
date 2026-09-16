# Architecture Overview

## System Architecture

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      Client Applications                     │
│                    (Web, Mobile, Desktop)                    │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP/HTTPS
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                      Express.js Server                       │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Middleware Layer                        │   │
│  │  - Helmet (Security Headers)                        │   │
│  │  - CORS (Cross-Origin Resource Sharing)             │   │
│  │  - Morgan (Logging)                                 │   │
│  │  - Express JSON Parser                              │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Routing Layer                           │   │
│  │  - /api/users                                       │   │
│  │  - /api/items                                       │   │
│  │  - /api/auctions                                    │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Controller Layer                        │   │
│  │  - Request validation                               │   │
│  │  - Response formatting                              │   │
│  │  - Error handling                                   │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Service Layer                           │   │
│  │  - Business logic                                   │   │
│  │  - Data processing                                  │   │
│  │  - Validation                                       │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────────────┬────────────────────────────────────┘
                         │ Database Queries
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                      Prisma ORM                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Query Builder & Type Safety                         │   │
│  │  - Auto-generated types from schema                 │   │
│  │  - Query optimization                               │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────────────┬────────────────────────────────────┘
                         │ PostgreSQL Protocol
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  PostgreSQL Database                         │
│                   (Hosted on Supabase)                       │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Tables:                                             │   │
│  │  - Users                                             │   │
│  │  - Items/Products                                    │   │
│  │  - Auctions                                          │   │
│  │  - Bids                                              │   │
│  │  - Transactions                                      │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Layered Architecture

### 1. **Presentation Layer (API Endpoints)**
- Handles HTTP requests and responses
- Validates incoming data
- Formats outgoing responses
- Located in: `src/routes/`

### 2. **Controller Layer**
- Processes requests
- Calls appropriate services
- Handles response formatting
- Error handling at route level
- Located in: `src/controllers/`

### 3. **Service Layer**
- Contains all business logic
- Performs data transformations
- Calls database operations through Prisma
- Handles data validation
- Located in: `src/services/`

### 4. **Data Access Layer (Prisma)**
- Manages all database operations
- Type-safe queries with auto-generated types
- Connection pooling through pg adapter
- Located in: `src/generated/prisma/` (auto-generated)

### 5. **Database Layer**
- PostgreSQL database on Supabase
- Stores persistent data
- Enforces data integrity

## Request Flow

```
1. Client sends HTTP request
   ↓
2. Express receives request
   ↓
3. Middleware processes (CORS, Logging, JSON parsing)
   ↓
4. Router matches route pattern
   ↓
5. Controller extracts and validates data
   ↓
6. Service executes business logic
   ↓
7. Prisma executes database query
   ↓
8. PostgreSQL returns data
   ↓
9. Service processes result
   ↓
10. Controller formats response
    ↓
11. Response sent to client
```

## Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Runtime | Node.js | JavaScript runtime |
| Framework | Express.js | Web framework |
| ORM | Prisma 7 | Database abstraction |
| Database Driver | @prisma/adapter-pg | PostgreSQL adapter |
| Database | PostgreSQL (Supabase) | Data persistence |
| Security | Helmet | HTTP security headers |
| CORS | CORS library | Cross-origin requests |
| Logging | Morgan | HTTP request logging |
| Environment | dotenv | Environment configuration |

## Environment Configuration

```
.env
├── DATABASE_URL          # Pooled connection (queries)
├── DIRECT_URL           # Direct connection (migrations)
└── PORT                 # Server port (default: 5000)
```

## Error Handling Strategy

```
Global Error Handler
├── 400 - Bad Request (validation errors)
├── 401 - Unauthorized (authentication)
├── 403 - Forbidden (authorization)
├── 404 - Not Found (resource doesn't exist)
└── 500 - Internal Server Error
```

## Deployment Considerations

- **Database**: Supabase (PostgreSQL)
- **Server**: Node.js Express application
- **Environment Variables**: Managed via .env files
- **Migrations**: Run via `npx prisma migrate deploy`
- **Scaling**: Connection pooling through PgBouncer (Supabase)

## Development Workflow

```
1. Create/modify schema in prisma/schema.prisma
   ↓
2. Run migration: npx prisma migrate dev --name <description>
   ↓
3. Prisma generates updated types
   ↓
4. Implement services using generated types
   ↓
5. Create controllers using services
   ↓
6. Define routes in route files
   ↓
7. Test API endpoints
   ↓
8. Commit changes to version control
```

## Performance Optimization

- Connection pooling via PgBouncer
- Prisma query caching where applicable
- Proper database indexing on frequently queried fields
- Middleware optimization for minimal overhead
- Response compression consideration for large payloads

## Security Measures

- Helmet middleware for security headers
- CORS configured for allowed origins
- Input validation in services
- SQL injection prevention via Prisma (parameterized queries)
- Environment variables for sensitive data (not in code)
- Graceful error messages (no sensitive information in responses)
