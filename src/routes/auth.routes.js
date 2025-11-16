const express = require('express');
const router = express.Router();
const {
  registerApp,
  getApiKey,
  revokeKey,
  regenerateKey,
} = require('../controllers/auth.controller');

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new application and generate an API key
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: "My Mobile App"
 *               description:
 *                 type: string
 *                 example: "Analytics for mobile application"
 *     responses:
 *       201:
 *         description: Application registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     appId:
 *                       type: string
 *                     apiKey:
 *                       type: string
 *                     message:
 *                       type: string
 *       400:
 *         description: Bad request
 */
router.post('/register', registerApp);

/**
 * @swagger
 * /api/auth/api-key:
 *   get:
 *     summary: Get API keys for an application
 *     tags: [Authentication]
 *     parameters:
 *       - in: query
 *         name: app_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Application ID
 *     responses:
 *       200:
 *         description: List of API keys
 *       400:
 *         description: Bad request
 */
router.get('/api-key', getApiKey);

/**
 * @swagger
 * /api/auth/revoke:
 *   post:
 *     summary: Revoke an API key
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - api_key_id
 *             properties:
 *               api_key_id:
 *                 type: string
 *     responses:
 *       200:
 *         description: API key revoked successfully
 *       404:
 *         description: API key not found
 */
router.post('/revoke', revokeKey);

/**
 * @swagger
 * /api/auth/regenerate:
 *   post:
 *     summary: Regenerate API key (revokes old and creates new)
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - app_id
 *             properties:
 *               app_id:
 *                 type: string
 *     responses:
 *       200:
 *         description: API key regenerated successfully
 *       400:
 *         description: Bad request
 */
router.post('/regenerate', regenerateKey);

module.exports = router;

