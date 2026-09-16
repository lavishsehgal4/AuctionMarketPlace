const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');

// Import auth routes
const authRoutes = require('./auth/auth.routes');

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
