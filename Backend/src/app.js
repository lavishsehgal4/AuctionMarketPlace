const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');

// Import auth routes
const authRoutes = require('./auth/auth.routes');

// Import category routes
const categoryRoutes = require('./categoryManagement/category.routes');

const app = express();

// ============================================
// CORS Configuration
// ============================================
const corsOptions = {
  origin: 'http://localhost:5173', // Frontend URL (Vite default)
  credentials: true, // Allow cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
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
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

module.exports = app;
