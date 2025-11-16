const { getPool } = require('../config/db');
const { getRedis } = require('../config/redis');
const { genId } = require('../utils/keygen');
const crypto = require('crypto');

/**
 * Create a short URL
 * POST /api/shorten
 * Requires x-api-key header
 */
async function createShortUrl(req, res) {
  try {
    const { url, slug } = req.body;

    if (!url || typeof url !== 'string' || url.trim().length === 0) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'url is required and must be a valid URL string.',
      });
    }

    // Validate URL format
    try {
      new URL(url);
    } catch (urlError) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Invalid URL format.',
      });
    }

    const pool = await getPool();
    let finalSlug = slug;

    // Generate slug if not provided
    if (!finalSlug) {
      // Generate a random 8-character slug
      finalSlug = crypto.randomBytes(4).toString('base64url').substring(0, 8);
    }

    // Check if slug already exists
    const [existing] = await pool.execute(
      'SELECT id FROM short_urls WHERE slug = ?',
      [finalSlug]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        error: 'Conflict',
        message: 'Slug already exists. Please choose a different slug.',
      });
    }

    const shortUrlId = genId();
    await pool.execute(
      'INSERT INTO short_urls (id, app_id, slug, original_url) VALUES (?, ?, ?, ?)',
      [shortUrlId, req.app.id, finalSlug, url.trim()]
    );

    res.status(201).json({
      success: true,
      data: {
        slug: finalSlug,
        short_url: `${req.protocol}://${req.get('host')}/s/${finalSlug}`,
        original_url: url.trim(),
      },
    });
  } catch (error) {
    console.error('Create short URL error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to create short URL.',
    });
  }
}

/**
 * Redirect short URL and log click event
 * GET /s/:slug
 */
async function redirectShortUrl(req, res) {
  try {
    const { slug } = req.params;

    const pool = await getPool();
    const [rows] = await pool.execute(
      'SELECT id, app_id, original_url FROM short_urls WHERE slug = ?',
      [slug]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Short URL not found.',
      });
    }

    const shortUrl = rows[0];

    // Increment click count
    await pool.execute(
      'UPDATE short_urls SET click_count = click_count + 1 WHERE id = ?',
      [shortUrl.id]
    );

    // Log click event
    // Get the first active API key for this app to associate the event
    const [apiKeys] = await pool.execute(
      'SELECT id FROM api_keys WHERE app_id = ? AND is_revoked = FALSE LIMIT 1',
      [shortUrl.app_id]
    );

    if (apiKeys.length > 0) {
      const eventId = genId();
      
      // Safely get IP address (works in both production and test environments)
      let ipAddress = null;
      try {
        // Try Express's req.ip first (if trust proxy is set)
        if (req.ip && typeof req.ip === 'string') {
          ipAddress = req.ip;
        }
      } catch (e) {
        // req.ip might fail in test environment, ignore
      }
      
      // Fallback to other methods
      if (!ipAddress) {
        ipAddress = req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
                    req.headers['x-real-ip'] ||
                    req.connection?.remoteAddress ||
                    req.socket?.remoteAddress ||
                    null;
      }
      
      const userAgent = req.headers['user-agent'] || null;

      await pool.execute(
        `INSERT INTO events (
          id, app_id, api_key_id, event_name, user_id, 
          ip_address, user_agent, properties, timestamp
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          eventId,
          shortUrl.app_id,
          apiKeys[0].id,
          'short_url_click',
          `anonymous_${ipAddress}`,
          ipAddress,
          userAgent,
          JSON.stringify({ slug, short_url_id: shortUrl.id }),
        ]
      );
    }

    // Redirect to original URL
    res.redirect(302, shortUrl.original_url);
  } catch (error) {
    console.error('Redirect short URL error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to redirect short URL.',
    });
  }
}

module.exports = {
  createShortUrl,
  redirectShortUrl,
};

