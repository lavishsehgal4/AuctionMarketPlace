# Frontend Source Structure

## Folder Layout

```
src/
├── api/           # All data-fetching logic and API calls
├── components/    # Small, reusable UI pieces (no pages, no routing)
├── pages/         # Full page views, one file per screen
├── utils/         # Shared utility functions
├── App.jsx        # Root component — sets up routing and auth state
├── main.jsx       # Entry point — mounts App into the DOM
└── STRUCTURE.md   # This file
```

---

## What Each Folder Is For

### api/
Functions that communicate with backend APIs. When backend exists, you only change these files.

**Files:**
- `authApi.js` - Authentication API calls
  - `registerUser(data)` - Register new user (email, password, full_name, display_name)
  - `loginUser(data)` - Login user (email, password)
  - `logoutUser()` - Logout user (invalidates refresh token)
  - `refreshAccessToken()` - Get new access token when expired

- `axiosInstance.js` - Axios instance with auto token refresh
  - Intercepts 401 responses
  - Automatically calls `/refresh-token` if access token expired
  - Retries failed requests with new token
  - Queues requests during token refresh to prevent race conditions
  - Redirects to `/login` if refresh token invalid/expired

- `auctionsApi.js` - Auction API calls (existing)
- `bidsApi.js` - Bid API calls (existing)

**Rule:** Pages and components import from here, never call backend directly.

### components/
Small, reusable UI pieces.

**Files:**
- `Navbar.jsx` - Navigation bar
  - Shows "Login" and "Register" buttons if not authenticated
  - Shows "Welcome, {name}!" and "Logout" button if authenticated
  - Receives `currentUser` and `onLogout` as props

- Other existing components remain unchanged

### pages/
One file per screen.

**Files:**
- `LoginPage.jsx` - User login
  - Form with email and password
  - Calls `loginUser()` API
  - On success, calls `onLoginSuccess(user)`
  - Validates required fields client-side

- `RegisterPage.jsx` - User registration
  - Form with email, password, full name, display name
  - Client-side password validation (8+ chars, uppercase, lowercase, number, special char)
  - Confirms password matches
  - Calls `registerUser()` API
  - On success, calls `onLoginSuccess(user)`
  - Shows field-level error messages

- Existing pages remain unchanged

### utils/
Pure helper functions (existing).

---

## Authentication Flow

### On App Load:
1. App checks `localStorage` for stored user data
2. If user exists, set as `currentUser`
3. If not, show empty home page with login/register buttons

### Registration Flow:
1. User fills RegisterPage form
2. Frontend validates: email format, password strength, fields required
3. Submit calls `registerUser()` from authApi.js
4. Backend creates user, returns user + access token
5. Frontend stores user in state + localStorage
6. Axios automatically stores token in cookies (via `withCredentials`)
7. Redirect to home page

### Login Flow:
1. User fills LoginPage form
2. Frontend validates: email, password required
3. Submit calls `loginUser()` from authApi.js
4. Backend authenticates, returns user + access token
5. Frontend stores user in state + localStorage
6. Axios stores token in cookies
7. Redirect to home page

### Logout Flow:
1. User clicks "Logout" button in Navbar
2. Call `logoutUser()` from authApi.js
3. Backend invalidates refresh token in database
4. Frontend clears user from state + localStorage
5. Redirect to home page

### Access Token Expiration (Auto-Refresh):
1. Frontend makes API request with access token (in cookies)
2. Backend returns 401 + `code: TOKEN_EXPIRED`
3. **axiosInstance interceptor** automatically:
   - Calls `POST /api/auth/refresh-token`
   - Gets new access token
   - Retries original request with new token
4. If refresh fails, redirect to login page
5. User doesn't notice anything - happens silently

---

## State Management

**App.jsx** manages:
- `currentUser` - Logged-in user object or null
- `isLoading` - Initial load state

**User data persisted in:**
- **State** - For component access
- **localStorage** - For page refresh persistence
- **Cookies** - Tokens managed by axios (httpOnly cookies from backend)

**Token refresh handled by:**
- **axios interceptor** (axiosInstance.js) - Auto refresh on 401

---

## Protected Routes

```
/login              → Public (redirect if already logged in)
/register           → Public (redirect if already logged in)
/                   → Home (shows different content if logged in)
/auctions           → Protected (redirect to login if not logged in)
/auction/:id        → Protected
/seller             → Protected
```

---

## API Integration Points

### authApi.js:
```javascript
import axiosInstance from './axiosInstance';

registerUser({ email, password, full_name, display_name })
  ↓
axiosInstance.post('/api/auth/register', data)
  ↓
Backend creates user + returns tokens

loginUser({ email, password })
  ↓
axiosInstance.post('/api/auth/login', data)
  ↓
Backend authenticates + returns tokens

logoutUser()
  ↓
axiosInstance.post('/api/auth/logout', {})
  ↓
Backend invalidates refresh token
```

### axiosInstance.js Interceptors:
```
Response 401 (TOKEN_EXPIRED)
  ↓
Call POST /api/auth/refresh-token
  ↓
Get new access token
  ↓
Retry original request
  ↓
If refresh fails → redirect to /login
```

---

## Naming Conventions

| Thing          | Convention          | Example                  |
|----------------|---------------------|--------------------------|
| Pages          | PascalCase + "Page" | LoginPage.jsx            |
| Components     | PascalCase          | Navbar.jsx               |
| CSS Modules    | Same name + .css    | Navbar.css               |
| API files      | camelCase + "Api"   | authApi.js               |
| Utilities      | camelCase           | axiosInstance.js         |

---

## Data Flow Diagram

```
User Registration/Login
        ↓
RegisterPage.jsx / LoginPage.jsx
        ↓
authApi.js (registerUser / loginUser)
        ↓
axiosInstance.js
        ↓
Backend API (POST /auth/register or /auth/login)
        ↓
Tokens in cookies + User data returned
        ↓
Frontend stores user in state + localStorage
        ↓
Navbar shows "Welcome, {user}!"

Later API Request with Expired Token
        ↓
Any Component calls API
        ↓
axiosInstance.js interceptor detects 401
        ↓
Auto calls POST /auth/refresh-token
        ↓
New token returned
        ↓
Original request retried
        ↓
Response success
```

---

## Environment Variables

Add to `.env` or `.env.local`:
```
VITE_API_BASE_URL=http://localhost:3000
```

(Currently hardcoded in authApi.js, but can be extracted later)

---

## Key Features Implemented

✅ Real backend authentication (not fake login)
✅ Register with email, password, name
✅ Login with email, password
✅ Logout with backend token invalidation
✅ Automatic token refresh on expiration
✅ Password strength validation (frontend)
✅ User persistence (localStorage + cookies)
✅ Protected routes
✅ Navbar shows different content based on auth state
✅ Clean separation: API layer, Components, Pages
✅ Error handling with user-friendly messages
