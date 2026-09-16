# Code Structure

## Folder Organization

```
Backend/
├── src/
│   ├── app.js                 # Express app setup with middleware
│   ├── server.js              # Server entry point
│   ├── routes/                # API routes
│   ├── controllers/           # Business logic handlers
│   ├── services/              # Database services
│   ├── models/                # Data models
│   ├── middleware/            # Custom middleware
│   ├── utils/                 # Utility functions
│   └── generated/
│       └── prisma/            # Auto-generated Prisma Client
│
├── prisma/
│   ├── schema.prisma          # Database schema definition
│   └── migrations/            # Database migration files
│
├── documentation/             # Project documentation
│   ├── codestructure.md       # This file
│   └── architecture.md        # Architecture overview
│
├── .env                       # Environment variables
├── .env.example               # Example environment variables
├── package.json               # Dependencies
├── test-connection.js         # Database connection test
└── prisma.config.js           # Prisma configuration
```

## File Descriptions

### Core Files

**`src/app.js`**
- Sets up Express application
- Configures middleware (cors, morgan, helmet, express.json)
- Defines health check and welcome routes
- Includes error handling and 404 handler
- Exports the app instance

**`src/server.js`**
- Entry point for the server
- Loads environment variables
- Starts the Express server on configured PORT
- Handles graceful shutdown

### Prisma Files

**`prisma/schema.prisma`**
- Defines database schema
- Specifies models and their fields
- Contains generator and datasource configuration

**`prisma/migrations/`** (created after first migration)
- Contains migration files for database schema changes
- Each migration tracks incremental schema updates

### Generated Files

**`src/generated/prisma/`**
- Auto-generated Prisma Client
- Never edit manually
- Regenerate with: `npx prisma generate`

## Module Organization Strategy

### Routes (`src/routes/`)
Handle HTTP request routing

### Controllers (`src/controllers/`)
Handle request/response logic

### Services (`src/services/`)
Contains business logic and database operations

### Middleware (`src/middleware/`)
Custom authentication, validation, and processing

### Utils (`src/utils/`)
Helper functions for common tasks

## Naming Conventions

- **Files**: `camelCase.js`
- **Folders**: `lowercase`
- **Classes**: `PascalCase`
- **Functions**: `camelCase`
- **Constants**: `UPPER_SNAKE_CASE`

## Dependencies

- **express**: Web framework
- **@prisma/client**: Database ORM
- **@prisma/adapter-pg**: PostgreSQL adapter for Prisma 7
- **pg**: PostgreSQL driver
- **cors**: Cross-Origin Resource Sharing
- **morgan**: HTTP request logger
- **helmet**: Security headers
- **dotenv**: Environment variable management
