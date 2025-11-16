-- Unified Event Analytics Engine Database Schema
-- MySQL 8.0+

CREATE DATABASE IF NOT EXISTS analytics_db;
USE analytics_db;

-- Applications table
CREATE TABLE IF NOT EXISTS apps (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- API Keys table
CREATE TABLE IF NOT EXISTS api_keys (
  id VARCHAR(36) PRIMARY KEY,
  app_id VARCHAR(36) NOT NULL,
  api_key VARCHAR(64) NOT NULL UNIQUE,
  is_revoked BOOLEAN DEFAULT FALSE,
  expires_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  revoked_at TIMESTAMP NULL,
  FOREIGN KEY (app_id) REFERENCES apps(id) ON DELETE CASCADE,
  INDEX idx_app_id (app_id),
  INDEX idx_api_key (api_key),
  INDEX idx_is_revoked (is_revoked),
  INDEX idx_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Events table
CREATE TABLE IF NOT EXISTS events (
  id VARCHAR(36) PRIMARY KEY,
  app_id VARCHAR(36) NOT NULL,
  api_key_id VARCHAR(36) NOT NULL,
  event_name VARCHAR(255) NOT NULL,
  user_id VARCHAR(255) NOT NULL,
  session_id VARCHAR(255),
  device_type VARCHAR(50),
  device_model VARCHAR(255),
  os_name VARCHAR(100),
  os_version VARCHAR(50),
  browser_name VARCHAR(100),
  browser_version VARCHAR(50),
  ip_address VARCHAR(45),
  user_agent TEXT,
  properties JSON,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (app_id) REFERENCES apps(id) ON DELETE CASCADE,
  FOREIGN KEY (api_key_id) REFERENCES api_keys(id) ON DELETE CASCADE,
  INDEX idx_app_event_timestamp (app_id, event_name, timestamp),
  INDEX idx_user_id (user_id),
  INDEX idx_event_name (event_name),
  INDEX idx_timestamp (timestamp),
  INDEX idx_session_id (session_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Short URLs table (optional feature)
CREATE TABLE IF NOT EXISTS short_urls (
  id VARCHAR(36) PRIMARY KEY,
  app_id VARCHAR(36) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  original_url TEXT NOT NULL,
  click_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (app_id) REFERENCES apps(id) ON DELETE CASCADE,
  INDEX idx_slug (slug),
  INDEX idx_app_id (app_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

