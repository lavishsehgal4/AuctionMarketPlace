# Auth Module Documentation

## Overview
Complete authentication module with registration, login, token refresh, and logout functionality. Uses JWT for access tokens and hashed random tokens for refresh tokens stored in database.

---

## Architecture Layers

### 1. **Routes Layer** (`auth.routes.js`)
Defines HTTP endpoints and connects them to controllers.

**Endpoints:**
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh-token` - Refresh access token
- `POST /api/auth/logout` - Logout user

---

### 2. **Controller Layer** (`auth.controller.js`)
Handles HTTP requests/responses and calls service layer.

**Functions:**
- `registerUserController()` - Handles registration request
- `loginUserController()` - Handles login request
- `refreshAccessTokenController()` - Handles token refresh request
- `logoutUserController()` - Handles logout request

**Responsibilities:**
- Validate request body
- Call service functions
- Set/clear cookies
- Format responses

**Imports:**
- `auth.service` - For business logic
- Returns responses with tokens in cookies (httpOnly)

---

### 3. **Service Layer** (`auth.service.js`)
Business logic and orchestration between repository and utilities.

**Functions:**
- `registerUserService(credentials)` - Register user logic
- `loginUserService(credentials)` - Login user logic
- `refreshAccessTokenService(refreshToken)` - Token refresh logic
- `logoutUserService(refreshToken)` - Logout logic

**Responsibilities:**
- Validate inputs
- Call repository functions
- Use utils for token/password operations
- Handle business logic

**Imports:**
- `auth.repository` - Database operations
- `bcrypt.js` utils - Password hashing/validation
- `jwt.js` utils - Access token generation

---

### 4. **Repository Layer** (`auth.repository.js`)
Data access layer - all database operations.

**Functions:**
- `createUser(userData)` - Create user in DB
- `findUserByEmail(email)` - Get user by email
- `findUserById(userId)` - Get user by ID
- `emailExists(email)` - Check email exists
- `storeRefreshToken(userId, hashedToken)` - Store refresh token
- `findRefreshTokenByHash(tokenHash)` - Get refresh token
- `deleteRefreshToken(tokenHash)` - Delete refresh token (logout)
- `updateLastLogin(userId)` - Update login timestamp

**Imports:**
- `supabase.js` config - Gets Prisma client
- All DB operations via Prisma ORM

---

### 5. **Middleware Layer** (`auth.middleware.js`)
Middleware for protecting routes and extracting tokens.

**Functions:**
- `verifyAccessTokenMiddleware()` - Verify JWT access token
  - Extracts token from "Bearer" header
  - Verifies JWT signature/expiration
  - Attaches user data to `req.user`
  - Returns 401 if expired or invalid

- `extractRefreshTokenFromCookie()` - Extract refresh token from cookies
  - Gets refreshToken from cookies
  - Attaches to `req.refreshToken`
  - Used before refresh-token and logout routes

**Imports:**
- `jwt.js` utils - Token extraction/verification

---

## Token Flow

### Registration:
```
User submits (email, password, full_name, display_name)
    ↓
Controller validates input
    ↓
Service validates password strength
    ↓
Repository checks email doesn't exist
    ↓
Service hashes password with bcrypt
    ↓
Repository creates user
    ↓
Service generates JWT access token (24h)
    ↓
Service generates random refresh token with crypto
    ↓
Service hashes refresh token with SHA-256
    ↓
Repository stores hashed token in DB
    ↓
Controller sets both tokens in httpOnly cookies
    ↓
Response with user data
```

### Login:
```
User submits (email, password)
    ↓
Controller validates input
    ↓
Repository finds user by email
    ↓
Service compares password with bcrypt
    ↓
Check account status
    ↓
Service generates new JWT access token (24h)
    ↓
Service generates new random refresh token
    ↓
Repository stores hashed refresh token in DB
    ↓
Controller sets both tokens in httpOnly cookies
    ↓
Response with user data
```

### Refresh Token:
```
Frontend gets 401 (access token expired)
    ↓
Frontend calls /refresh-token with refresh token in cookie
    ↓
Middleware extracts refresh token from cookie
    ↓
Controller gets refresh token from req.refreshToken
    ↓
Service hashes refresh token (same way as stored)
    ↓
Repository finds token in DB
    ↓
Check token not expired
    ↓
Get user and check account status
    ↓
Service generates new JWT access token (24h)
    ↓
Controller sets new access token in cookie
    ↓
Response with user data
```

### Logout:
```
User clicks logout
    ↓
Frontend calls /logout with refresh token in cookie
    ↓
Middleware extracts refresh token
    ↓
Service deletes refresh token from database
    ↓
Controller clears both cookies
    ↓
Response success
```

---

## Utilities Used

### From `utils/jwt.js`:
- `generateAccessToken(userId, email, displayName)` - Creates JWT (24h)
- `verifyAccessToken(token)` - Verifies JWT signature/expiration
- `extractTokenFromHeader(authHeader)` - Extracts from "Bearer token"

### From `utils/bcrypt.js`:
- `hashPassword(plainPassword)` - Hash password with bcrypt
- `comparePassword(plainPassword, hashedPassword)` - Verify password
- `validatePasswordStrength(password)` - Check password requirements
- `generateRefreshToken()` - Generate random token + hash
- `verifyRefreshToken(plainToken, hashedToken)` - Verify token match

---

## Database Schema

### User Table:
```
User {
  id: UUID (primary key)
  email: String (unique)
  password_hash: String (bcrypt hashed)
  full_name: String
  display_name: String
  account_status: ACTIVE | SUSPENDED | BANNED
  phone: String (optional)
  avatar_url: String (optional)
  kyc_status: NOT_STARTED | PENDING | VERIFIED | REJECTED
  last_login_at: DateTime (optional)
  created_at: DateTime
  updated_at: DateTime
  deleted_at: DateTime (optional)
}
```

### RefreshToken Table:
```
RefreshToken {
  id: UUID (primary key)
  user_id: UUID (foreign key to User)
  token_hash: String (unique, SHA-256 hashed)
  expires_at: DateTime (7 days from creation)
  created_at: DateTime
}
```

---

## Cookie Configuration

### Access Token Cookie:
- **Name:** `accessToken`
- **Value:** JWT token
- **Max Age:** 24 hours
- **httpOnly:** true (not accessible from JavaScript)
- **Secure:** true (in production only)
- **SameSite:** strict

### Refresh Token Cookie:
- **Name:** `refreshToken`
- **Value:** Random hex string (plain)
- **Max Age:** 7 days
- **httpOnly:** true (not accessible from JavaScript)
- **Secure:** true (in production only)
- **SameSite:** strict

---

## Error Handling

| Status | Scenario | Response |
|--------|----------|----------|
| 400 | Missing required fields | { success: false, message: "..." } |
| 400 | Invalid password format | { success: false, message: "...", errors: [...] } |
| 409 | Email already registered | { success: false, message: "Email already registered" } |
| 401 | Invalid credentials | { success: false, message: "Invalid email or password" } |
| 401 | Access token expired | { success: false, message: "Access token expired", code: "TOKEN_EXPIRED" } |
| 401 | Invalid refresh token | { success: false, message: "Invalid refresh token", code: "REFRESH_TOKEN_INVALID" } |
| 403 | Account suspended/banned | { success: false, message: "Account is suspended/banned" } |
| 500 | Server error | { success: false, message: "..." } |

---

## Frontend Integration

### Registration:
```javascript
POST /api/auth/register
body: { email, password, full_name, display_name }
// Cookies set automatically
```

### Login:
```javascript
POST /api/auth/login
body: { email, password }
// Cookies set automatically
```

### Protected Route Request:
```javascript
GET /api/protected
headers: { Authorization: "Bearer <accessToken>" }
// or read from cookies if frontend has access
```

### Refresh Token:
```javascript
// When access token returns 401 (expired):
POST /api/auth/refresh-token
// Refresh token sent in cookies automatically
// Server returns new accessToken in cookie
```

### Logout:
```javascript
POST /api/auth/logout
// Both cookies cleared by server
```

---

## Password Requirements

- **Minimum 8 characters**
- **At least 1 uppercase letter (A-Z)**
- **At least 1 lowercase letter (a-z)**
- **At least 1 number (0-9)**
- **At least 1 special character (!@#$%^&*)**

---

## Security Features

✅ Passwords hashed with bcrypt (salt rounds: 10)
✅ JWT access tokens signed with secret
✅ Refresh tokens stored as hashed SHA-256 in DB
✅ httpOnly cookies (JavaScript cannot access)
✅ Secure cookie flag in production
✅ SameSite=strict to prevent CSRF
✅ Password strength validation
✅ Account status checking (active/suspended/banned)
✅ Token expiration checks
✅ Email uniqueness validation
