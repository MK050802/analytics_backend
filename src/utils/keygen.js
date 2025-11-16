const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

/**
 * Generate a unique ID using UUID v4
 * @returns {string} UUID v4 string
 */
function genId() {
  return uuidv4();
}

/**
 * Generate a secure random API key
 * Uses crypto.randomBytes for cryptographically secure randomness
 * @param {number} length - Length in bytes (default: 32)
 * @returns {string} Hexadecimal string of length * 2
 */
function genApiKey(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

module.exports = {
  genId,
  genApiKey,
};

