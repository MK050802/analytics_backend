const express = require('express');
const router = express.Router();
const apiKeyAuth = require('../middlewares/apiKeyAuth');
const {
  collectEvent,
  eventSummary,
  userStats,
} = require('../controllers/analytics.controller');

/**
 * @swagger
 * /api/analytics/collect:
 *   post:
 *     summary: Collect an analytics event
 *     tags: [Analytics]
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - event_name
 *               - user_id
 *             properties:
 *               event_name:
 *                 type: string
 *                 example: "page_view"
 *               user_id:
 *                 type: string
 *                 example: "user_123"
 *               session_id:
 *                 type: string
 *                 example: "session_456"
 *               device_type:
 *                 type: string
 *                 example: "mobile"
 *               device_model:
 *                 type: string
 *                 example: "iPhone 13"
 *               os_name:
 *                 type: string
 *                 example: "iOS"
 *               os_version:
 *                 type: string
 *                 example: "15.0"
 *               browser_name:
 *                 type: string
 *                 example: "Safari"
 *               browser_version:
 *                 type: string
 *                 example: "15.0"
 *               properties:
 *                 type: object
 *                 example: {"page": "/home", "referrer": "google.com"}
 *     responses:
 *       201:
 *         description: Event collected successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post('/collect', apiKeyAuth, collectEvent);

/**
 * @swagger
 * /api/analytics/event-summary:
 *   get:
 *     summary: Get event summary/aggregation
 *     tags: [Analytics]
 *     parameters:
 *       - in: query
 *         name: event
 *         required: true
 *         schema:
 *           type: string
 *         description: Event name
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Start date (ISO 8601). Defaults to 7 days ago.
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: End date (ISO 8601). Defaults to now.
 *       - in: query
 *         name: app_id
 *         schema:
 *           type: string
 *         description: Filter by application ID (optional)
 *     responses:
 *       200:
 *         description: Event summary
 *       400:
 *         description: Bad request
 */
router.get('/event-summary', eventSummary);

/**
 * @swagger
 * /api/analytics/user-stats:
 *   get:
 *     summary: Get user statistics
 *     tags: [Analytics]
 *     parameters:
 *       - in: query
 *         name: user_id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *       - in: query
 *         name: app_id
 *         schema:
 *           type: string
 *         description: Filter by application ID (optional)
 *     responses:
 *       200:
 *         description: User statistics
 *       400:
 *         description: Bad request
 *       404:
 *         description: User not found
 */
// router.get('/user-stats', userStats);

module.exports = router;

