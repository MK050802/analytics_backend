const express = require('express');
const router = express.Router();
const apiKeyAuth = require('../middlewares/apiKeyAuth');
const {
  createShortUrl,
  redirectShortUrl,
} = require('../controllers/shorturl.controller');

/**
 * @swagger
 * /api/shorten:
 *   post:
 *     summary: Create a short URL
 *     tags: [Short URLs]
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - url
 *             properties:
 *               url:
 *                 type: string
 *                 format: uri
 *                 example: "https://example.com/very/long/url"
 *               slug:
 *                 type: string
 *                 example: "my-slug"
 *     responses:
 *       201:
 *         description: Short URL created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       409:
 *         description: Slug already exists
 */
router.post('/shorten', apiKeyAuth, createShortUrl);

/**
 * @swagger
 * /s/{slug}:
 *   get:
 *     summary: Redirect short URL and log click event
 *     tags: [Short URLs]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Short URL slug
 *     responses:
 *       302:
 *         description: Redirect to original URL
 *       404:
 *         description: Short URL not found
 */
router.get('/:slug', redirectShortUrl);

module.exports = router;

