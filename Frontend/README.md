# Auction Marketplace Frontend

## Current Scope

The current implemented experience is the bidder auction-discovery home. It uses mock data through the API adapter and makes no requests to backend endpoints that do not yet exist.

## Run

```bash
npm install
npm run dev
```

## Feature Map

| UI feature | Main files | Purpose |
|---|---|---|
| Application routing and stored login state | `src/App.jsx` | Selects the bidder home after bidder login, protects authenticated routes, and handles logout state |
| Navbar | `src/components/Navbar.jsx`, `src/components/Navbar.css` | Guest view provides Login/Register only; authenticated view changes navigation by account type |
| Bidder home banner | `src/pages/BidderHomePage.jsx`, `src/pages/BidderHomePage.module.css` | Welcome/banner space shown directly below the navbar |
| Auction/Auctioneer selector | `src/pages/BidderHomePage.jsx`, `src/pages/BidderHomePage.module.css` | Auctions is active; Auctioneers is intentionally disabled until that feature is planned |
| Category tabs | `src/pages/BidderHomePage.jsx`, `src/api/categoriesApi.js` | Loads public categories from `GET /api/v1/categories` and filters both mock auction discovery sections by category name |
| Live Auctions and On Deck | `src/pages/BidderHomePage.jsx`, `src/components/AuctionCard.jsx` | Splits mock auctions by `status` and renders reusable cards |
| Auction card | `src/components/AuctionCard.jsx`, `src/components/AuctionCard.module.css` | Displays a listing image, category, bid amount, bid count, countdown, and link to detail |
| Footer | `src/components/Footer.jsx`, `src/components/Footer.module.css` | Shared bottom section for the bidder home |
| Mock auction data | `src/api/auctionsApi.js`, `src/data/auctions.json` | `getAuctions()` currently reads local JSON; replace this adapter with `GET /api/v1/auctions` when frontend-backend integration begins |
| Authentication requests | `src/api/authApi.js`, `src/api/axiosInstance.js` | Contains Auth API communication separately from pages/components |
| Auction detail and bid form | `src/pages/AuctionDetailPage.jsx`, `src/components/BidForm.jsx`, `src/components/BidHistory.jsx` | Existing follow-up screens; real bidding integration is not implemented yet |
| Seller products | `src/pages/SellerDashboardPage.jsx`, `src/api/productsApi.js`, `src/api/categoriesApi.js` | Loads seller products from `GET /api/v1/products/my-products`, loads category options from `GET /api/v1/categories`, and creates products through `POST /api/v1/products` |
| Seller auction registration | `src/pages/SellerDashboardPage.jsx`, `src/api/auctionsApi.js` | Selects an eligible product from an image card panel and calls `POST /api/v1/auctions`; validates positive prices and a future start time before submitting |
| Seller dashboard | `src/pages/SellerDashboardPage.jsx`, `src/pages/SellerDashboardPage.module.css`, `src/components/Navbar.jsx` | Single-page seller desk with anchored Dashboard, Products, Create Product, Register Auction, My Auctions, and Profile sections; auction history remains component-local mock data |

## Routes

| Route | Access | Screen |
|---|---|---|
| `/` | Guest | Redirects to `/login` |
| `/` | Bidder | Bidder auction discovery home |
| `/` | Seller | Redirects to `/seller` |
| `/auctions` | Authenticated | Bidder auction discovery home |
| `/auction/:id` | Authenticated | Existing auction detail view |
| `/seller` | Seller | Seller dashboard; navbar links scroll to dashboard sections |
| `/login` | Guest | Login |
| `/register` | Guest | Registration |

## API Rule

Components and pages do not directly call Axios or `fetch`. API modules inside `src/api/` own all data communication. Until a backend endpoint exists and is integrated, the module returns mock data instead.

## Next Frontend Work

1. Replace `getAuctions()` mock data with the versioned Auction API.
2. Build the real bid flow after the Bid backend API exists.
3. Add bidder history and result pages after their paginated APIs exist.
4. Connect login persistence to `GET /api/v1/auth/me` rather than trusting only local storage.

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
