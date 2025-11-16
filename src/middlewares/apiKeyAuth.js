const { getPool } = require('../config/db');

/**
 * Middleware to authenticate requests using API key
 * Validates API key from x-api-key header
 * Attaches app info to req.app if valid
 */
async function apiKeyAuth(req, res, next) {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'API key is required. Please provide x-api-key header.',
    });
  }

  try {
    const pool = await getPool();
    
    // Query to find valid API key
    // Check: key exists, not revoked, and not expired
    const [rows] = await pool.execute(
      `SELECT 
        ak.id,
        ak.app_id,
        ak.api_key,
        ak.is_revoked,
        ak.expires_at,
        a.name as app_name
      FROM api_keys ak
      INNER JOIN apps a ON ak.app_id = a.id
      WHERE ak.api_key = ? 
        AND ak.is_revoked = FALSE
        AND (ak.expires_at IS NULL OR ak.expires_at > NOW())`,
      [apiKey]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid or revoked API key.',
      });
    }

    const keyData = rows[0];

    // Attach app info to request object
    req.app = {
      id: keyData.app_id,
      apiKeyId: keyData.id,
      name: keyData.app_name,
    };

    next();
  } catch (error) {
    console.error('API key authentication error:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to authenticate API key.',
    });
  }
}

module.exports = apiKeyAuth;

