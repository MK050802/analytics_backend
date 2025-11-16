const { getPool } = require('../config/db');
const { getRedis } = require('../config/redis');
const { genId } = require('../utils/keygen');

/**
 * Collect an analytics event
 * POST /api/analytics/collect
 * Requires x-api-key header
 */
async function collectEvent(req, res) {
  try {
    const {
      event_name,
      user_id,
      session_id,
      device_type,
      device_model,
      os_name,
      os_version,
      browser_name,
      browser_version,
      properties,
    } = req.body;

    // Validate required fields
    if (!event_name || typeof event_name !== 'string' || event_name.trim().length === 0) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'event_name is required and must be a non-empty string.',
      });
    }

    if (!user_id || typeof user_id !== 'string' || user_id.trim().length === 0) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'user_id is required and must be a non-empty string.',
      });
    }

    const pool = await getPool();
    const eventId = genId();
    const ipAddress = req.ip || req.connection.remoteAddress || null;
    const userAgent = req.headers['user-agent'] || null;

    // Insert event into database
    // Note: For high-volume serverless, consider batching events
    // and flushing periodically or using a message queue (e.g., SQS, RabbitMQ)
    await pool.execute(
      `INSERT INTO events (
        id, app_id, api_key_id, event_name, user_id, session_id,
        device_type, device_model, os_name, os_version,
        browser_name, browser_version, ip_address, user_agent, properties, timestamp
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        eventId,
        req.app.id,
        req.app.apiKeyId,
        event_name.trim(),
        user_id.trim(),
        session_id || null,
        device_type || null,
        device_model || null,
        os_name || null,
        os_version || null,
        browser_name || null,
        browser_version || null,
        ipAddress,
        userAgent,
        properties ? JSON.stringify(properties) : null,
      ]
    );

    res.status(201).json({
      success: true,
      data: {
        eventId,
        message: 'Event collected successfully.',
      },
    });
  } catch (error) {
    console.error('Collect event error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to collect event.',
    });
  }
}

/**
 * Get event summary/aggregation
 * GET /api/analytics/event-summary
 * Query params: event, startDate, endDate, app_id (optional)
 */
async function eventSummary(req, res) {
  try {
    const { event, startDate, endDate, app_id } = req.query;

    if (!event) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'event query parameter is required.',
      });
    }

    // Default to last 7 days if dates not provided
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Invalid date format. Use ISO 8601 format (YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss).',
      });
    }

    // Build cache key
    const cacheKey = `event_summary:${event}:${app_id || 'all'}:${start.toISOString()}:${end.toISOString()}`;

    // Try to get from cache
    const redis = await getRedis();
    if (redis) {
      try {
        const cached = await redis.get(cacheKey);
        if (cached) {
          return res.json({
            success: true,
            data: JSON.parse(cached),
            cached: true,
          });
        }
      } catch (cacheError) {
        console.error('Redis cache read error:', cacheError);
        // Continue to database query
      }
    }

    const pool = await getPool();
    let query;
    let params;

    if (app_id) {
      // Aggregate for specific app
      query = `
        SELECT 
          COUNT(*) as total_count,
          COUNT(DISTINCT user_id) as unique_users,
          device_type,
          COUNT(*) as device_count
        FROM events
        WHERE event_name = ?
          AND app_id = ?
          AND timestamp >= ?
          AND timestamp <= ?
        GROUP BY device_type
      `;
      params = [event, app_id, start, end];
    } else {
      // Aggregate across all apps
      query = `
        SELECT 
          COUNT(*) as total_count,
          COUNT(DISTINCT user_id) as unique_users,
          device_type,
          COUNT(*) as device_count
        FROM events
        WHERE event_name = ?
          AND timestamp >= ?
          AND timestamp <= ?
        GROUP BY device_type
      `;
      params = [event, start, end];
    }

    const [rows] = await pool.execute(query, params);

    // Calculate totals
    const totalCount = rows.reduce((sum, row) => sum + parseInt(row.total_count, 10), 0);
    const uniqueUsers = new Set();
    rows.forEach((row) => {
      // Note: This is approximate; for exact unique users, use a subquery
      // For production, consider: COUNT(DISTINCT user_id) in main query
    });

    // Re-query for exact unique users count
    let uniqueUsersQuery;
    let uniqueUsersParams;
    if (app_id) {
      uniqueUsersQuery = `
        SELECT COUNT(DISTINCT user_id) as unique_users_count
        FROM events
        WHERE event_name = ? AND app_id = ? AND timestamp >= ? AND timestamp <= ?
      `;
      uniqueUsersParams = [event, app_id, start, end];
    } else {
      uniqueUsersQuery = `
        SELECT COUNT(DISTINCT user_id) as unique_users_count
        FROM events
        WHERE event_name = ? AND timestamp >= ? AND timestamp <= ?
      `;
      uniqueUsersParams = [event, start, end];
    }

    const [uniqueRows] = await pool.execute(uniqueUsersQuery, uniqueUsersParams);
    const uniqueUsersCount = uniqueRows[0]?.unique_users_count || 0;

    // Build device breakdown
    const deviceBreakdown = rows.map((row) => ({
      device_type: row.device_type || 'unknown',
      count: parseInt(row.device_count, 10),
    }));

    const result = {
      event_name: event,
      app_id: app_id || null,
      date_range: {
        start: start.toISOString(),
        end: end.toISOString(),
      },
      summary: {
        total_count: totalCount,
        unique_users: uniqueUsersCount,
      },
      device_breakdown: deviceBreakdown,
    };

    // Cache result
    if (redis) {
      try {
        const ttl = parseInt(process.env.CACHE_TTL_SEC || '300', 10);
        await redis.setEx(cacheKey, ttl, JSON.stringify(result));
      } catch (cacheError) {
        console.error('Redis cache write error:', cacheError);
        // Continue without caching
      }
    }

    res.json({
      success: true,
      data: result,
      cached: false,
    });
  } catch (error) {
    console.error('Event summary error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to retrieve event summary.',
    });
  }
}

/**
 * Get user statistics
 * GET /api/analytics/user-stats
 * Query params: user_id, app_id (optional)
 */
async function userStats(req, res) {
  try {
    const { user_id, app_id } = req.query;

    if (!user_id) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'user_id query parameter is required.',
      });
    }

    const pool = await getPool();
    let query;
    let params;

    if (app_id) {
      query = `
        SELECT 
          COUNT(*) as total_events,
          MIN(timestamp) as first_seen,
          MAX(timestamp) as last_seen,
          ip_address
        FROM events
        WHERE user_id = ? AND app_id = ?
        GROUP BY ip_address
        ORDER BY last_seen DESC
        LIMIT 1
      `;
      params = [user_id, app_id];
    } else {
      query = `
        SELECT 
          COUNT(*) as total_events,
          MIN(timestamp) as first_seen,
          MAX(timestamp) as last_seen,
          ip_address
        FROM events
        WHERE user_id = ?
        GROUP BY ip_address
        ORDER BY last_seen DESC
        LIMIT 1
      `;
      params = [user_id];
    }

    const [rows] = await pool.execute(query, params);

    if (rows.length === 0) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'No events found for this user.',
      });
    }

    // Get recent events metadata
    let recentEventsQuery;
    let recentEventsParams;
    if (app_id) {
      recentEventsQuery = `
        SELECT event_name, timestamp, properties
        FROM events
        WHERE user_id = ? AND app_id = ?
        ORDER BY timestamp DESC
        LIMIT 10
      `;
      recentEventsParams = [user_id, app_id];
    } else {
      recentEventsQuery = `
        SELECT event_name, timestamp, properties
        FROM events
        WHERE user_id = ?
        ORDER BY timestamp DESC
        LIMIT 10
      `;
      recentEventsParams = [user_id];
    }

    const [recentEvents] = await pool.execute(recentEventsQuery, recentEventsParams);

    const stats = rows[0];
    const result = {
      user_id,
      app_id: app_id || null,
      total_events: parseInt(stats.total_events, 10),
      first_seen: stats.first_seen,
      last_seen: stats.last_seen,
      ip_address: stats.ip_address,
      recent_events: recentEvents.map((event) => ({
        event_name: event.event_name,
        timestamp: event.timestamp,
        properties: event.properties ? JSON.parse(event.properties) : null,
      })),
    };

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('User stats error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to retrieve user statistics.',
    });
  }
}

module.exports = {
  collectEvent,
  eventSummary,
  userStats,
};

