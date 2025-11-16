# Pre-Upload Verification Checklist

Use this checklist to ensure your project is ready for submission.

## ✅ Quick Verification Steps

### 1. File Structure Check
```bash
# Run this to verify all required files exist
```

**Required Files:**
- [ ] `package.json` - Dependencies and scripts
- [ ] `schema.sql` - Database schema
- [ ] `Dockerfile` - Docker configuration
- [ ] `docker-compose.yml` - Docker Compose setup
- [ ] `vercel.json` - Vercel deployment config
- [ ] `.env.example` - Environment variables template
- [ ] `README.md` - Complete documentation
- [ ] `src/index.js` - Express app
- [ ] `src/server.js` - Server entry point
- [ ] `src/config/db.js` - Database config
- [ ] `src/config/redis.js` - Redis config
- [ ] `src/utils/keygen.js` - Key generation
- [ ] `src/middlewares/apiKeyAuth.js` - Auth middleware
- [ ] `src/middlewares/rateLimiter.js` - Rate limiting
- [ ] `src/controllers/auth.controller.js` - Auth controller
- [ ] `src/controllers/analytics.controller.js` - Analytics controller
- [ ] `src/controllers/shorturl.controller.js` - Short URL controller
- [ ] `src/routes/auth.routes.js` - Auth routes
- [ ] `src/routes/analytics.routes.js` - Analytics routes
- [ ] `src/routes/shorturl.routes.js` - Short URL routes
- [ ] `src/swagger.js` - Swagger setup
- [ ] `tests/api.test.js` - Test suite
- [ ] `scripts/seed-sample-data.js` - Seed script

### 2. Dependencies Check
```bash
npm install
```
- [ ] All dependencies install without errors
- [ ] No missing peer dependencies warnings
- [ ] `node_modules` folder created successfully

### 3. Database Setup Check
```bash
# Start MySQL
docker-compose up -d mysql

# Wait 10-15 seconds, then check
docker-compose ps mysql

# Verify schema can be applied
mysql -u root -p < schema.sql
# OR using Docker:
docker exec -i analytics_mysql mysql -uroot -prootpassword < schema.sql
```
- [ ] MySQL container starts successfully
- [ ] Schema applies without errors
- [ ] All tables created (apps, api_keys, events, short_urls)

### 4. Environment Variables Check
```bash
# Copy example file
cp .env.example .env

# Edit .env with your values
# At minimum, set MySQL credentials
```
- [ ] `.env` file exists (not committed to git)
- [ ] `.env.example` exists with all required variables
- [ ] MySQL credentials are set
- [ ] Redis URL is set (optional, can be empty)

### 5. Application Startup Check
```bash
npm run dev
```
- [ ] Server starts without errors
- [ ] Port 3000 is accessible
- [ ] Health check works: `curl http://localhost:3000/health`
- [ ] Swagger docs accessible: `http://localhost:3000/docs`
- [ ] No connection errors in console

### 6. API Endpoints Check

#### Authentication Endpoints
```bash
# 1. Register App
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name": "Test App", "description": "Test"}'
```
- [ ] Returns 201 with appId and apiKey

```bash
# 2. List API Keys (use appId from above)
curl "http://localhost:3000/api/auth/api-key?app_id=YOUR_APP_ID"
```
- [ ] Returns 200 with API keys list

```bash
# 3. Regenerate Key (use appId from above)
curl -X POST http://localhost:3000/api/auth/regenerate \
  -H "Content-Type: application/json" \
  -d '{"app_id": "YOUR_APP_ID"}'
```
- [ ] Returns 200 with new API key

#### Analytics Endpoints
```bash
# 1. Collect Event (use apiKey from registration)
curl -X POST http://localhost:3000/api/analytics/collect \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_API_KEY" \
  -d '{"event_name": "test_event", "user_id": "user_123"}'
```
- [ ] Returns 201 with eventId
- [ ] Without API key returns 401

```bash
# 2. Event Summary (use appId from registration)
curl "http://localhost:3000/api/analytics/event-summary?event=test_event&app_id=YOUR_APP_ID"
```
- [ ] Returns 200 with summary data

```bash
# 3. User Stats
curl "http://localhost:3000/api/analytics/user-stats?user_id=user_123&app_id=YOUR_APP_ID"
```
- [ ] Returns 200 with user statistics

### 7. Error Handling Check
```bash
# Test missing API key
curl -X POST http://localhost:3000/api/analytics/collect \
  -H "Content-Type: application/json" \
  -d '{"event_name": "test", "user_id": "user_123"}'
```
- [ ] Returns 401 Unauthorized

```bash
# Test invalid API key
curl -X POST http://localhost:3000/api/analytics/collect \
  -H "Content-Type: application/json" \
  -H "x-api-key: invalid-key" \
  -d '{"event_name": "test", "user_id": "user_123"}'
```
- [ ] Returns 401 Unauthorized

```bash
# Test missing required fields
curl -X POST http://localhost:3000/api/analytics/collect \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_API_KEY" \
  -d '{"user_id": "user_123"}'
```
- [ ] Returns 400 Bad Request

### 8. Test Suite Check
```bash
# Create .env.test file first
# Then run:
npm test
```
- [ ] All tests pass
- [ ] No test failures
- [ ] Coverage report generated

### 9. Docker Check
```bash
# Build Docker image
docker build -t analytics-backend .

# Start all services
docker-compose up -d

# Check all services are running
docker-compose ps
```
- [ ] Docker image builds successfully
- [ ] All services start (app, mysql, redis)
- [ ] App is accessible on port 3000

### 10. Code Quality Check
- [ ] No console.log statements for debugging (use console.error for errors)
- [ ] No TODO comments left in code
- [ ] No hardcoded secrets or credentials
- [ ] All environment variables use process.env
- [ ] SQL queries use parameterized statements
- [ ] Error handling is consistent

### 11. Documentation Check
- [ ] README.md has setup instructions
- [ ] README.md has API examples
- [ ] README.md has deployment instructions
- [ ] README.md has troubleshooting section
- [ ] Swagger docs are accessible at /docs
- [ ] All endpoints documented in Swagger

### 12. Git Check (if using version control)
```bash
# Check what will be committed
git status

# Verify .env is in .gitignore
cat .gitignore | grep .env
```
- [ ] `.env` is in `.gitignore`
- [ ] `node_modules` is in `.gitignore`
- [ ] No sensitive data in committed files
- [ ] `.env.example` is committed (template only)

## 🚨 Common Issues to Fix Before Upload

1. **Missing .env file** - Create from .env.example
2. **Database not running** - Start with docker-compose
3. **Schema not applied** - Run schema.sql
4. **Port already in use** - Change PORT in .env
5. **MySQL connection refused** - Check credentials in .env
6. **Tests failing** - Ensure test database exists and schema applied

## ✅ Final Pre-Upload Checklist

- [ ] All files present and correct
- [ ] Application starts without errors
- [ ] All API endpoints work
- [ ] Test suite passes
- [ ] Docker setup works
- [ ] No sensitive data in code
- [ ] Documentation complete
- [ ] README has all required sections

## 📦 Ready to Upload When:

✅ All checks above pass
✅ Application runs locally
✅ Tests pass
✅ No errors in console
✅ Documentation is complete

