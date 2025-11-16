require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const globalRateLimiter = require('./middlewares/rateLimiter');
const setupSwagger = require('./swagger');

// Import routes
const authRoutes = require('./routes/auth.routes');
const analyticsRoutes = require('./routes/analytics.routes');
const shortUrlRoutes = require('./routes/shorturl.routes');

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Trust proxy for accurate IP addresses (important for Vercel/serverless)
app.set('trust proxy', 1);

// Global rate limiting
app.use(globalRateLimiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API routes
const apiPrefix = process.env.API_PREFIX || '/api';
app.use(`${apiPrefix}/auth`, authRoutes);
app.use(`${apiPrefix}/analytics`, analyticsRoutes);
app.use(`${apiPrefix}`, shortUrlRoutes);

// Short URL redirect route (outside API prefix)
app.use('/s', shortUrlRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Unified Event Analytics Engine API',
    version: '1.0.0',
    docs: '/docs',
    health: '/health',
  });
});

// Setup Swagger documentation
setupSwagger(app);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' 
      ? 'An error occurred' 
      : err.message,
  });
});

module.exports = app;

