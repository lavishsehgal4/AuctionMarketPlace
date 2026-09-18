const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');

// Import auth routes
const authRoutes = require('./auth/auth.routes');

// Import category routes
const categoryRoutes = require('./categoryManagement/category.routes');

// Import product routes
const productRoutes = require('./product/product.routes');
const auctionRoutes = require('./auction/auction.routes');
const AppError = require('./errors/AppError');
const errorHandler = require('./errors/errorHandler');

const app = express();

// ============================================
// CORS Configuration
// ============================================
const corsOptions = {
  origin: 'http://localhost:5173', // Frontend URL (Vite default)
  credentials: true, // Allow cookies
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// Middleware
app.use(cors(corsOptions));
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'Server is running' });
});

// Basic welcome route
app.get('/', (req, res) => {
  res.status(200).json({ message: 'Welcome to Auction MarketPlace API' });
});

// ============================================
// API Routes
// ============================================
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/auctions', auctionRoutes);

// 404 handler
app.use((req, res, next) => {
  next(new AppError('Route not found', 404, 'ROUTE_NOT_FOUND'));
});

// Error handler
app.use(errorHandler);

module.exports = app;
