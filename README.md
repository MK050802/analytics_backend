# Unified Event Analytics Engine

A production-ready backend API for collecting and analyzing events from web and mobile applications. Built with Express.js, MySQL, and Redis, designed for serverless deployment on Vercel.

## 🎯 Features

- **Application Registration**: Register apps and generate secure API keys
- **Event Collection**: Collect analytics events with flexible metadata
- **Event Aggregation**: Query event summaries with date ranges and filters
- **User Analytics**: Get detailed statistics for individual users
- **Short URL Management**: Create short URLs with click tracking (bonus feature)
- **Rate Limiting**: Global rate limiting with Redis support for per-key limits
- **Caching**: Redis-based caching for heavy aggregation queries
- **API Documentation**: Interactive Swagger/OpenAPI documentation
- **Docker Support**: Full Docker Compose setup for local development
- **Test Suite**: Comprehensive Jest + Supertest integration tests

## 📋 Prerequisites

- Node.js 18+ 
- MySQL 8.0+
- Redis (optional, for caching)
- Docker & Docker Compose (for local development)

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd analytics-backend
npm install
```

### 2. Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
PORT=3000
NODE_ENV=development

# MySQL Configuration
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=rootpassword
MYSQL_DATABASE=analytics_db

# Redis Configuration (Upstash)
UPSTASH_REDIS_URL=redis://default:password@host:port
# Leave empty if not using Redis (graceful degradation)

# Cache Configuration
CACHE_TTL_SEC=300

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 3. Database Setup

#### Option A: Using Docker Compose (Recommended)

```bash
# Start MySQL and Redis
docker-compose up -d mysql redis

# Wait for MySQL to be ready (about 10-15 seconds)
# The schema.sql will be automatically executed on first run
```

#### Option B: Manual MySQL Setup

```bash
# Create database and run schema
mysql -u root -p < schema.sql
```

### 4. Run the Application

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

The API will be available at `http://localhost:3000`

- **API Documentation**: http://localhost:3000/docs
- **Health Check**: http://localhost:3000/health

## 📚 API Endpoints

### Authentication

#### Register Application
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Mobile App",
    "description": "Analytics for mobile application"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "appId": "uuid-here",
    "apiKey": "64-char-hex-string",
    "message": "Application registered successfully..."
  }
}
```

#### List API Keys
```bash
curl "http://localhost:3000/api/auth/api-key?app_id=YOUR_APP_ID"
```

#### Revoke API Key
```bash
curl -X POST http://localhost:3000/api/auth/revoke \
  -H "Content-Type: application/json" \
  -d '{
    "api_key_id": "key-id-here"
  }'
```

#### Regenerate API Key
```bash
curl -X POST http://localhost:3000/api/auth/regenerate \
  -H "Content-Type: application/json" \
  -d '{
    "app_id": "YOUR_APP_ID"
  }'
```

### Analytics

#### Collect Event
```bash
curl -X POST http://localhost:3000/api/analytics/collect \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_API_KEY" \
  -d '{
    "event_name": "page_view",
    "user_id": "user_123",
    "session_id": "session_456",
    "device_type": "mobile",
    "device_model": "iPhone 13",
    "os_name": "iOS",
    "os_version": "15.0",
    "browser_name": "Safari",
    "browser_version": "15.0",
    "properties": {
      "page": "/home",
      "referrer": "google.com"
    }
  }'
```

#### Event Summary
```bash
curl "http://localhost:3000/api/analytics/event-summary?event=page_view&startDate=2024-01-01&endDate=2024-01-31&app_id=YOUR_APP_ID"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "event_name": "page_view",
    "app_id": "uuid-here",
    "date_range": {
      "start": "2024-01-01T00:00:00.000Z",
      "end": "2024-01-31T23:59:59.999Z"
    },
    "summary": {
      "total_count": 1500,
      "unique_users": 320
    },
    "device_breakdown": [
      {
        "device_type": "mobile",
        "count": 900
      },
      {
        "device_type": "desktop",
        "count": 600
      }
    ]
  },
  "cached": false
}
```

#### User Statistics
```bash
curl "http://localhost:3000/api/analytics/user-stats?user_id=user_123&app_id=YOUR_APP_ID"
```

### Short URLs (Bonus Feature)

#### Create Short URL
```bash
curl -X POST http://localhost:3000/api/shorten \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_API_KEY" \
  -d '{
    "url": "https://example.com/very/long/url",
    "slug": "my-slug"
  }'
```

#### Redirect Short URL
```bash
curl -L "http://localhost:3000/s/my-slug"
```

## 🧪 Testing

### Run Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch
```

### Test Setup

1. **Create test database** (or use Docker Compose):
   ```bash
   # Using Docker
   docker-compose up -d mysql
   
   # Or manually
   mysql -u root -p -e "CREATE DATABASE analytics_db_test;"
   ```

2. **Configure test environment**:
   Create `.env.test`:
   ```env
   MYSQL_HOST=localhost
   MYSQL_PORT=3306
   MYSQL_USER=root
   MYSQL_PASSWORD=rootpassword
   MYSQL_DATABASE=analytics_db_test
   ```

3. **Run schema on test database**:
   ```bash
   mysql -u root -p analytics_db_test < schema.sql
   ```

### Test Coverage

The test suite includes:
- ✅ Health check endpoint
- ✅ Application registration
- ✅ API key management (list, revoke, regenerate)
- ✅ Event collection with authentication
- ✅ Event summary aggregation
- ✅ User statistics
- ✅ Error handling (400, 401, 404, 500)
- ✅ Rate limiting

## 🐳 Docker Development

### Start All Services

```bash
docker-compose up -d
```

This starts:
- MySQL on port 3306
- Redis on port 6379
- Application on port 3000

### View Logs

```bash
docker-compose logs -f app
```

### Stop Services

```bash
docker-compose down
```

### Reset Database

```bash
docker-compose down -v
docker-compose up -d mysql
```

## 📦 GitHub Repository Setup

### Quick Setup (Windows PowerShell)

```powershell
# Run the setup script
.\scripts\setup-github.ps1
```

### Manual Setup

1. **Initialize Git:**
   ```bash
   git init
   git add .
   git commit -m "chore: initial project scaffold"
   ```

2. **Create GitHub Repository:**
   - Go to [GitHub.com](https://github.com/new)
   - Create a new repository (don't initialize with README)
   - Copy the repository URL

3. **Push to GitHub:**
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/analytics-backend.git
   git branch -M main
   git push -u origin main
   ```

4. **Verify .env is NOT committed:**
   ```bash
   git check-ignore .env  # Should return .env
   ```

📚 **See [GITHUB_SETUP.md](./GITHUB_SETUP.md) for detailed instructions.**

## 🚀 Deployment to Vercel

### 1. Install Vercel CLI

```bash
npm i -g vercel
```

### 2. Deploy

```bash
vercel
```

Follow the prompts to link your project.

### 3. Set Environment Variables

In Vercel dashboard or via CLI:

```bash
vercel env add MYSQL_HOST
vercel env add MYSQL_PORT
vercel env add MYSQL_USER
vercel env add MYSQL_PASSWORD
vercel env add MYSQL_DATABASE
vercel env add UPSTASH_REDIS_URL
vercel env add CACHE_TTL_SEC
vercel env add RATE_LIMIT_WINDOW_MS
vercel env add RATE_LIMIT_MAX_REQUESTS
vercel env add NODE_ENV production
```

### 3. Required Environment Variables for Vercel

```
MYSQL_HOST=your-mysql-host
MYSQL_PORT=3306
MYSQL_USER=your-user
MYSQL_PASSWORD=your-password
MYSQL_DATABASE=analytics_db
UPSTASH_REDIS_URL=redis://default:password@host:port
CACHE_TTL_SEC=300
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
NODE_ENV=production
```

### 4. Database Considerations for Serverless

- **Connection Pooling**: The code uses a singleton pool pattern to reuse connections across serverless invocations
- **MySQL Hosting**: Use a managed MySQL service (e.g., PlanetScale, AWS RDS, Google Cloud SQL)
- **Redis**: Use Upstash Redis (serverless-friendly) or another managed Redis service

### 5. Redeploy

```bash
vercel --prod
```

## 📊 Seeding Sample Data

Generate synthetic events for testing:

```bash
# Set number of events, users, and days
export SEED_EVENTS=1000
export SEED_USERS=100
export SEED_DAYS=30

node scripts/seed-sample-data.js
```

This will:
1. Create a test app
2. Generate an API key
3. Insert synthetic events
4. Print summary with API key for testing

## 🏗️ Architecture Decisions

### Why MySQL?

- **Relational Data**: Apps, API keys, and events have clear relationships
- **ACID Compliance**: Ensures data integrity for critical operations
- **Mature Ecosystem**: Well-supported with connection pooling for serverless
- **Indexing**: Efficient queries on event_name, user_id, timestamps

### Why Redis Caching?

- **Performance**: Aggregation queries can be expensive; caching reduces DB load
- **Cost**: Fewer database queries = lower costs
- **Scalability**: Redis handles high read throughput
- **Graceful Degradation**: System works without Redis (slower but functional)

### Scaling Considerations

**When to move to ClickHouse or Postgres partitions:**

1. **Event Volume**: > 1M events/day
2. **Query Performance**: Aggregation queries taking > 5 seconds
3. **Storage Costs**: MySQL storage costs becoming prohibitive
4. **Real-time Requirements**: Need sub-second aggregations

**Migration Path:**
- **ClickHouse**: For time-series analytics, columnar storage, fast aggregations
- **Postgres Partitions**: For maintaining relational model with better performance
- **Hybrid**: Keep MySQL for metadata (apps, keys), use ClickHouse for events

## 🔒 Security Considerations

### API Key Storage

**Current Implementation**: API keys are stored as plain text in the database for assessment ease.

**Production Recommendation**: 
- Hash API keys using bcrypt or Argon2
- Store only the hash in the database
- Compare hashes during authentication
- Never return full keys in responses (already implemented - keys are masked)

### SQL Injection Prevention

- All queries use parameterized statements (`mysql2/promise` prepared statements)
- User input is validated and sanitized
- No string concatenation in SQL queries

### Rate Limiting

- Global rate limiting per IP (configurable)
- Can be extended to per-API-key rate limiting using Redis (see `src/middlewares/rateLimiter.js`)

## 📝 Checklist for Submission

### Core Requirements
- [x] POST /api/auth/register - Register app & generate API key
- [x] GET /api/auth/api-key - List API keys
- [x] POST /api/auth/revoke - Revoke API key
- [x] POST /api/auth/regenerate - Regenerate API key
- [x] POST /api/analytics/collect - Collect events (with API key auth)
- [x] GET /api/analytics/event-summary - Event aggregation
- [x] GET /api/analytics/user-stats - User statistics
- [x] MySQL schema with proper indexes
- [x] Docker & docker-compose setup
- [x] Vercel configuration
- [x] Swagger documentation
- [x] Test suite (Jest + Supertest)
- [x] README with setup instructions

### Bonus Features
- [x] Short URL management (POST /api/shorten, GET /s/:slug)
- [x] Swagger examples for endpoints
- [x] Seed script for sample data

### Code Quality
- [x] Modular file structure
- [x] Environment variable usage
- [x] Connection pooling for serverless
- [x] Error handling
- [x] Logging
- [x] Parameterized queries (SQL injection prevention)
- [x] Rate limiting
- [x] Redis caching with graceful degradation

## 🐛 Troubleshooting

### Database Connection Issues

```bash
# Check MySQL is running
docker-compose ps mysql

# Check connection
mysql -h localhost -u root -p

# Verify schema
mysql -u root -p analytics_db -e "SHOW TABLES;"
```

### Redis Connection Issues

- Redis is optional; the app works without it (caching disabled)
- Check `UPSTASH_REDIS_URL` format: `redis://default:password@host:port`
- For local Redis: `redis://localhost:6379`

### Rate Limit Errors

- Default: 100 requests per 15 minutes per IP
- Adjust `RATE_LIMIT_MAX_REQUESTS` and `RATE_LIMIT_WINDOW_MS` in `.env`

### Test Failures

1. Ensure test database exists and schema is applied
2. Check `.env.test` configuration
3. Verify MySQL is accessible
4. Increase test timeout if needed

## 📄 License

MIT

## 🤝 Contributing

This is an assessment project. For production use, consider:
- Adding API key hashing
- Implementing per-key rate limiting
- Adding request validation middleware
- Setting up monitoring and alerting
- Adding database migrations system
- Implementing event batching for high volume

---

**Built with ❤️ for the Unified Event Analytics Engine assessment**

