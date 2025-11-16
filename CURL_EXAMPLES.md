# Quick CURL Examples

## Complete Workflow: Register → Collect → Summary

### 1. Register Application

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Mobile App",
    "description": "Analytics for mobile application"
  }'
```

**Save the `appId` and `apiKey` from the response.**

### 2. Collect an Event

```bash
curl -X POST http://localhost:3000/api/analytics/collect \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_API_KEY_HERE" \
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

### 3. Get Event Summary

```bash
curl "http://localhost:3000/api/analytics/event-summary?event=page_view&app_id=YOUR_APP_ID_HERE"
```

### 4. Get User Statistics

```bash
curl "http://localhost:3000/api/analytics/user-stats?user_id=user_123&app_id=YOUR_APP_ID_HERE"
```

## All Endpoints

### Authentication

```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name": "Test App", "description": "Test"}'

# List API Keys
curl "http://localhost:3000/api/auth/api-key?app_id=APP_ID"

# Revoke Key
curl -X POST http://localhost:3000/api/auth/revoke \
  -H "Content-Type: application/json" \
  -d '{"api_key_id": "KEY_ID"}'

# Regenerate Key
curl -X POST http://localhost:3000/api/auth/regenerate \
  -H "Content-Type: application/json" \
  -d '{"app_id": "APP_ID"}'
```

### Analytics

```bash
# Collect Event
curl -X POST http://localhost:3000/api/analytics/collect \
  -H "Content-Type: application/json" \
  -H "x-api-key: API_KEY" \
  -d '{
    "event_name": "button_click",
    "user_id": "user_123"
  }'

# Event Summary
curl "http://localhost:3000/api/analytics/event-summary?event=page_view&startDate=2024-01-01&endDate=2024-01-31&app_id=APP_ID"

# User Stats
curl "http://localhost:3000/api/analytics/user-stats?user_id=user_123&app_id=APP_ID"
```

### Short URLs (Bonus)

```bash
# Create Short URL
curl -X POST http://localhost:3000/api/shorten \
  -H "Content-Type: application/json" \
  -H "x-api-key: API_KEY" \
  -d '{
    "url": "https://example.com/very/long/url",
    "slug": "my-slug"
  }'

# Redirect (browser or curl -L)
curl -L "http://localhost:3000/s/my-slug"
```

