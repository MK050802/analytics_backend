const { createClient } = require('redis');

let redisClient = null;

/**
 * Get or create Redis client (singleton pattern)
 * Returns null if UPSTASH_REDIS_URL is not set (graceful degradation)
 * @returns {Promise<import('redis').RedisClientType | null>}
 */
async function getRedis() {
  // If already connected, return existing client
  if (redisClient && redisClient.isOpen) {
    return redisClient;
  }

  // If URL not provided, return null (graceful degradation)
  if (!process.env.UPSTASH_REDIS_URL) {
    console.log('⚠️  Redis URL not provided, caching disabled');
    return null;
  }

  try {
    redisClient = createClient({
      url: process.env.UPSTASH_REDIS_URL,
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 10) {
            console.error('Redis reconnection failed after 10 attempts');
            return new Error('Redis connection failed');
          }
          return Math.min(retries * 100, 3000);
        },
      },
    });

    redisClient.on('error', (err) => {
      console.error('Redis client error:', err);
    });

    redisClient.on('connect', () => {
      console.log('✅ Redis client connected');
    });

    redisClient.on('reconnecting', () => {
      console.log('🔄 Redis client reconnecting...');
    });

    await redisClient.connect();
    return redisClient;
  } catch (error) {
    console.error('Failed to create Redis client:', error);
    // Return null to allow graceful degradation
    return null;
  }
}

/**
 * Close Redis connection (useful for graceful shutdown)
 */
async function closeRedis() {
  if (redisClient && redisClient.isOpen) {
    await redisClient.quit();
    redisClient = null;
    console.log('Redis client closed');
  }
}

module.exports = {
  getRedis,
  closeRedis,
};

