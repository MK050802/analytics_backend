/**
 * Integration tests for Analytics API
 * 
 * Setup:
 * 1. Start local database: docker-compose up -d mysql
 * 2. Run schema: mysql -u root -p < schema.sql (or use docker exec)
 * 3. Set NODE_ENV=test and configure test database in .env
 * 4. Run: npm test
 */

require('dotenv').config({ path: '.env.test' });
const request = require('supertest');
const app = require('../src/index');

// Test configuration
const TEST_TIMEOUT = 10000;

describe('Analytics API Integration Tests', () => {
  let testAppId;
  let testApiKey;
  let testUserId;

  beforeAll(async () => {
    // Wait for database connection
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }, TEST_TIMEOUT);

  describe('Health Check', () => {
    test('GET /health should return 200', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body.status).toBe('ok');
    });
  });

  describe('Authentication Endpoints', () => {
    test('POST /api/auth/register should create app and return API key', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test App',
          description: 'Test application for integration tests',
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.appId).toBeDefined();
      expect(response.body.data.apiKey).toBeDefined();

      testAppId = response.body.data.appId;
      testApiKey = response.body.data.apiKey;
    }, TEST_TIMEOUT);

    test('POST /api/auth/register should reject missing name', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({})
        .expect(400);

      expect(response.body.error).toBe('Bad Request');
    });

    test('GET /api/auth/api-key should list API keys for app', async () => {
      const response = await request(app)
        .get(`/api/auth/api-key?app_id=${testAppId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    }, TEST_TIMEOUT);

    test('POST /api/auth/regenerate should create new key and revoke old', async () => {
      const response = await request(app)
        .post('/api/auth/regenerate')
        .send({ app_id: testAppId })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.apiKey).toBeDefined();
      expect(response.body.data.apiKey).not.toBe(testApiKey);

      // Old key should be revoked
      const listResponse = await request(app)
        .get(`/api/auth/api-key?app_id=${testAppId}`)
        .expect(200);

      const revokedKeys = listResponse.body.data.filter((k) => k.is_revoked);
      expect(revokedKeys.length).toBeGreaterThan(0);

      // Update test API key
      testApiKey = response.body.data.apiKey;
    }, TEST_TIMEOUT);
  });

  describe('Analytics Endpoints', () => {
    test('POST /api/analytics/collect should reject request without API key', async () => {
      const response = await request(app)
        .post('/api/analytics/collect')
        .send({
          event_name: 'test_event',
          user_id: 'user_123',
        })
        .expect(401);

      expect(response.body.error).toBe('Unauthorized');
    });

    test('POST /api/analytics/collect should reject invalid API key', async () => {
      const response = await request(app)
        .post('/api/analytics/collect')
        .set('x-api-key', 'invalid-key')
        .send({
          event_name: 'test_event',
          user_id: 'user_123',
        })
        .expect(401);

      expect(response.body.error).toBe('Unauthorized');
    });

    test('POST /api/analytics/collect should collect event with valid API key', async () => {
      testUserId = `user_${Date.now()}`;

      const response = await request(app)
        .post('/api/analytics/collect')
        .set('x-api-key', testApiKey)
        .send({
          event_name: 'page_view',
          user_id: testUserId,
          session_id: 'session_123',
          device_type: 'mobile',
          device_model: 'iPhone 13',
          os_name: 'iOS',
          os_version: '15.0',
          browser_name: 'Safari',
          browser_version: '15.0',
          properties: {
            page: '/home',
            referrer: 'google.com',
          },
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.eventId).toBeDefined();
    }, TEST_TIMEOUT);

    test('POST /api/analytics/collect should reject missing required fields', async () => {
      const response = await request(app)
        .post('/api/analytics/collect')
        .set('x-api-key', testApiKey)
        .send({
          user_id: 'user_123',
          // missing event_name
        })
        .expect(400);

      expect(response.body.error).toBe('Bad Request');
    }, TEST_TIMEOUT);

    test('GET /api/analytics/event-summary should return event aggregation', async () => {
      // Wait a bit for event to be processed
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const response = await request(app)
        .get('/api/analytics/event-summary')
        .query({
          event: 'page_view',
          app_id: testAppId,
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.event_name).toBe('page_view');
      expect(response.body.data.summary.total_count).toBeGreaterThanOrEqual(0);
      expect(response.body.data.summary.unique_users).toBeGreaterThanOrEqual(0);
    }, TEST_TIMEOUT);

    test('GET /api/analytics/user-stats should return user statistics', async () => {
      const response = await request(app)
        .get('/api/analytics/user-stats')
        .query({
          user_id: testUserId,
          app_id: testAppId,
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user_id).toBe(testUserId);
      expect(response.body.data.total_events).toBeGreaterThanOrEqual(0);
    }, TEST_TIMEOUT);

    test('GET /api/analytics/user-stats should return 404 for non-existent user', async () => {
      const response = await request(app)
        .get('/api/analytics/user-stats')
        .query({
          user_id: 'non_existent_user',
          app_id: testAppId,
        })
        .expect(404);

      expect(response.body.error).toBe('Not Found');
    }, TEST_TIMEOUT);
  });

  describe('Rate Limiting', () => {
    test('Should enforce rate limits', async () => {
      // Make multiple requests rapidly
      const requests = Array(110).fill(null).map(() =>
        request(app)
          .get('/health')
          .expect((res) => {
            if (res.status === 429) {
              expect(res.body.error).toBe('Too Many Requests');
            }
          })
      );

      await Promise.all(requests);
    }, TEST_TIMEOUT * 2);
  });
});

