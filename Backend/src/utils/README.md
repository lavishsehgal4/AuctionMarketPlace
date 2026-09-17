# Utils Folder Documentation

## Overview
Utility functions used across the application for authentication, password management, and token handling.

---

## Files Summary

### 1. **jwt.js**
**Purpose:** JWT access token generation and verification

**Functions:**
- `generateAccessToken(userId, email, displayName)` - Create JWT access token (24h expiration)
- `verifyAccessToken(token)` - Verify & decode JWT token
- `extractTokenFromHeader(authHeader)` - Extract token from "Bearer token" format
- `decodeAccessToken(token)` - Decode without verification (for inspection only)

**Imports:**
- `jsonwebtoken` npm package

**Exports:**
- All 4 functions above

**Dependencies:**
- Requires `JWT_SECRET` in `.env`
- Used by: `auth.middleware.js`, `auth.controller.js`, `auth.service.js`

**Token Payload Includes:**
- `userId` - User's UUID
- `email` - User's email
- `displayName` - User's display name
- `type` - "access_token"

---

### 2. **bcrypt.js**
**Purpose:** Password hashing/comparison and refresh token generation

**Functions:**
- `hashPassword(plainPassword, saltRounds)` - Hash password with bcrypt
- `comparePassword(plainPassword, hashedPassword)` - Verify password match
- `validatePasswordStrength(password)` - Check password requirements
- `hashAndValidatePassword(plainPassword)` - Validate & hash in one step
- `generateRefreshToken()` - Generate random refresh token using crypto (returns plain + hashed)
- `verifyRefreshToken(plainToken, hashedToken)` - Verify refresh token match

**Imports:**
- `bcrypt` npm package (password hashing)
- `crypto` Node.js built-in (refresh token generation)

**Exports:**
- All 6 functions above

**Dependencies:**
- No external `.env` requirements
- Used by: `auth.service.js`, `auth.controller.js`

---

## Authentication Flow with Utils

### Login/Signup:
1. **Password:** User password → `hashPassword()` → Store in DB
2. **Access Token:** `generateAccessToken()` → Return to client (JWT, 24h)
3. **Refresh Token:** `generateRefreshToken()` → plainToken to client, hashedToken to DB

### Verify Requests:
1. **Access Token:** Extract from header → `verifyAccessToken()` → Get user data
2. **Refresh Token:** Extract from request → `verifyRefreshToken()` → Check if valid

---

## Refresh Token Storage Strategy

| Item | Where | Format |
|------|-------|--------|
| Plain Refresh Token | Client (cookie/localStorage) | Random hex string (64 chars) |
| Hashed Refresh Token | Database (RefreshToken table) | SHA-256 hash (64 chars) |

**Why two formats?**
- Client keeps plain token for requests
- DB keeps hash for security (if DB compromised, tokens still safe)
- Verification: hash the plain token and compare with DB hash

---

## Dependencies Between Utils
- No direct dependencies between `jwt.js` and `bcrypt.js`
- Both are independent utilities
- Used together in `auth.service.js` for complete auth flow

---

## Environment Variables Required

```
JWT_SECRET=your_jwt_secret_key_here_change_in_production
```

(Optional) For separate refresh token signing (currently uses JWT_SECRET):
```
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key_here_change_in_production
```
