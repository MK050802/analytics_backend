const rateLimit = require('express-rate-limit');

/**
 * Global rate limiter middleware
 * Limits requests per IP address
 * 
 * To implement per-API-key rate limiting with Redis:
 * 1. Install: npm install rate-limit-redis
 * 2. Import: const RedisStore = require('rate-limit-redis');
 * 3. Get Redis client: const redis = await getRedis();
 * 4. Configure store:
 *    store: redis ? new RedisStore({
 *      client: redis,
 *      prefix: 'rl:',
 *    }) : undefined,
 * 5. Use keyGenerator: (req) => req.app?.apiKeyId || req.ip
 */
const globalRateLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes default
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10), // 100 requests per window
  message: {
    error: 'Too Many Requests',
    message: 'Rate limit exceeded. Please try again later.',
  },
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  // Note: For per-key rate limiting, uncomment and configure Redis store above
  // store: ... (see comment above)
});

module.exports = globalRateLimiter;

