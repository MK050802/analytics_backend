const { getPool } = require('../config/db');
const { genId, genApiKey } = require('../utils/keygen');

/**
 * Register a new application and generate an API key
 * POST /api/auth/register
 */
async function registerApp(req, res) {
  try {
    const { name, description } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Application name is required and must be a non-empty string.',
      });
    }

    const pool = await getPool();
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      // Create app
      const appId = genId();
      await connection.execute(
        'INSERT INTO apps (id, name, description) VALUES (?, ?, ?)',
        [appId, name.trim(), description || null]
      );

      // Generate API key
      const apiKeyId = genId();
      const apiKey = genApiKey();

      await connection.execute(
        'INSERT INTO api_keys (id, app_id, api_key) VALUES (?, ?, ?)',
        [apiKeyId, appId, apiKey]
      );

      await connection.commit();

      res.status(201).json({
        success: true,
        data: {
          appId,
          apiKey,
          message: 'Application registered successfully. Save your API key securely.',
        },
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Register app error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to register application.',
    });
  }
}

/**
 * Get API keys for an application
 * GET /api/auth/api-key?app_id=...
 */
async function getApiKey(req, res) {
  try {
    const { app_id } = req.query;

    if (!app_id) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'app_id query parameter is required.',
      });
    }

    const pool = await getPool();
    const [rows] = await pool.execute(
      `SELECT 
        ak.id,
        ak.api_key,
        ak.is_revoked,
        ak.expires_at,
        ak.created_at,
        ak.revoked_at,
        a.name as app_name
      FROM api_keys ak
      INNER JOIN apps a ON ak.app_id = a.id
      WHERE ak.app_id = ?
      ORDER BY ak.created_at DESC`,
      [app_id]
    );

    // Mask API keys for security (show only last 8 characters)
    const maskedKeys = rows.map((row) => ({
      id: row.id,
      api_key: row.is_revoked ? 'REVOKED' : `****${row.api_key.slice(-8)}`,
      is_revoked: row.is_revoked,
      expires_at: row.expires_at,
      created_at: row.created_at,
      revoked_at: row.revoked_at,
      app_name: row.app_name,
    }));

    res.json({
      success: true,
      data: maskedKeys,
    });
  } catch (error) {
    console.error('Get API key error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to retrieve API keys.',
    });
  }
}

/**
 * Revoke an API key
 * POST /api/auth/revoke
 */
async function revokeKey(req, res) {
  try {
    const { api_key_id } = req.body;

    if (!api_key_id) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'api_key_id is required.',
      });
    }

    const pool = await getPool();
    const [result] = await pool.execute(
      'UPDATE api_keys SET is_revoked = TRUE, revoked_at = NOW() WHERE id = ?',
      [api_key_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'API key not found.',
      });
    }

    res.json({
      success: true,
      message: 'API key revoked successfully.',
    });
  } catch (error) {
    console.error('Revoke key error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to revoke API key.',
    });
  }
}

/**
 * Regenerate API key (revoke old and create new)
 * POST /api/auth/regenerate
 */
async function regenerateKey(req, res) {
  try {
    const { app_id } = req.body;

    if (!app_id) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'app_id is required.',
      });
    }

    const pool = await getPool();
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      // Revoke all existing keys for this app
      await connection.execute(
        'UPDATE api_keys SET is_revoked = TRUE, revoked_at = NOW() WHERE app_id = ? AND is_revoked = FALSE',
        [app_id]
      );

      // Generate new API key
      const apiKeyId = genId();
      const apiKey = genApiKey();

      await connection.execute(
        'INSERT INTO api_keys (id, app_id, api_key) VALUES (?, ?, ?)',
        [apiKeyId, app_id, apiKey]
      );

      await connection.commit();

      res.json({
        success: true,
        data: {
          apiKey,
          message: 'API key regenerated successfully. Old keys have been revoked.',
        },
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Regenerate key error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to regenerate API key.',
    });
  }
}

module.exports = {
  registerApp,
  getApiKey,
  revokeKey,
  regenerateKey,
};

