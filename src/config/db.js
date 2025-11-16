const mysql = require('mysql2/promise');

let pool = null;

/**
 * Get or create MySQL connection pool (singleton pattern)
 * Reuses connections across serverless invocations
 * @returns {Promise<mysql.Pool>}
 */
async function getPool() {
  if (pool) {
    return pool;
  }

  const config = {
    host: process.env.MYSQL_HOST || 'localhost',
    port: parseInt(process.env.MYSQL_PORT || '3306', 10),
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'analytics_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
    // Serverless-friendly: reuse connections
    reconnect: true,
  };

  try {
    pool = mysql.createPool(config);
    
    // Test connection
    const connection = await pool.getConnection();
    console.log('✅ MySQL connection pool created successfully');
    connection.release();
    
    // Handle pool errors
    pool.on('error', (err) => {
      console.error('MySQL pool error:', err);
      if (err.code === 'PROTOCOL_CONNECTION_LOST') {
        console.log('Attempting to reconnect to MySQL...');
        pool = null;
      }
    });
    
    return pool;
  } catch (error) {
    console.error('Failed to create MySQL pool:', error);
    throw error;
  }
}

/**
 * Close the connection pool (useful for graceful shutdown)
 */
async function closePool() {
  if (pool) {
    await pool.end();
    pool = null;
    console.log('MySQL pool closed');
  }
}

module.exports = {
  getPool,
  closePool,
};

