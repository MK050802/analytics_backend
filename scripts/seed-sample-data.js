/**
 * Seed script to generate synthetic analytics events for demo/testing
 * Usage: node scripts/seed-sample-data.js
 */

require('dotenv').config();
const { getPool } = require('../src/config/db');
const { genId, genApiKey } = require('../src/utils/keygen');

const eventNames = [
  'page_view',
  'button_click',
  'form_submit',
  'purchase',
  'signup',
  'login',
  'logout',
  'search',
  'video_play',
  'download',
];

const deviceTypes = ['mobile', 'desktop', 'tablet'];
const osNames = ['iOS', 'Android', 'Windows', 'macOS', 'Linux'];
const browserNames = ['Chrome', 'Safari', 'Firefox', 'Edge'];

function randomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

async function seedData() {
  try {
    const pool = await getPool();

    console.log('🌱 Starting data seeding...');

    // Create a test app
    const appId = genId();
    const appName = `Test App ${Date.now()}`;
    await pool.execute(
      'INSERT INTO apps (id, name, description) VALUES (?, ?, ?)',
      [appId, appName, 'Test application for seeding data']
    );
    console.log(`✅ Created app: ${appId}`);

    // Create API key
    const apiKeyId = genId();
    const apiKey = genApiKey();
    await pool.execute(
      'INSERT INTO api_keys (id, app_id, api_key) VALUES (?, ?, ?)',
      [apiKeyId, appId, apiKey]
    );
    console.log(`✅ Created API key: ${apiKey.slice(0, 8)}...`);

    // Generate events
    const numEvents = parseInt(process.env.SEED_EVENTS || '1000', 10);
    const numUsers = parseInt(process.env.SEED_USERS || '100', 10);
    const daysBack = parseInt(process.env.SEED_DAYS || '30', 10);

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);

    console.log(`📊 Generating ${numEvents} events for ${numUsers} users over ${daysBack} days...`);

    const batchSize = 100;
    let inserted = 0;

    for (let i = 0; i < numEvents; i += batchSize) {
      const batch = [];
      const currentBatchSize = Math.min(batchSize, numEvents - i);

      for (let j = 0; j < currentBatchSize; j++) {
        const userId = `user_${randomInt(1, numUsers)}`;
        const sessionId = `session_${randomInt(1, numUsers * 2)}`;
        const eventName = randomElement(eventNames);
        const deviceType = randomElement(deviceTypes);
        const osName = randomElement(osNames);
        const browserName = randomElement(browserNames);
        const timestamp = randomDate(startDate, endDate);

        const properties = {
          page: `/page/${randomInt(1, 20)}`,
          referrer: randomElement(['google.com', 'direct', 'facebook.com', 'twitter.com']),
          value: randomInt(0, 1000),
        };

        batch.push([
          genId(),
          appId,
          apiKeyId,
          eventName,
          userId,
          sessionId,
          deviceType,
          `Device ${randomInt(1, 10)}`,
          osName,
          `${randomInt(10, 15)}.${randomInt(0, 9)}`,
          browserName,
          `${randomInt(100, 120)}.${randomInt(0, 9)}`,
          `192.168.${randomInt(1, 255)}.${randomInt(1, 255)}`,
          `Mozilla/5.0 (${osName})`,
          JSON.stringify(properties),
          timestamp,
        ]);
      }

      await pool.query(
        `INSERT INTO events (
          id, app_id, api_key_id, event_name, user_id, session_id,
          device_type, device_model, os_name, os_version,
          browser_name, browser_version, ip_address, user_agent, properties, timestamp
        ) VALUES ?`,
        [batch]
      );

      inserted += currentBatchSize;
      process.stdout.write(`\r📈 Inserted ${inserted}/${numEvents} events...`);
    }

    console.log('\n✅ Data seeding completed!');
    console.log(`\n📋 Summary:`);
    console.log(`   App ID: ${appId}`);
    console.log(`   API Key: ${apiKey}`);
    console.log(`   Events: ${numEvents}`);
    console.log(`   Users: ${numUsers}`);
    console.log(`   Date Range: ${startDate.toISOString()} to ${endDate.toISOString()}`);

    await pool.end();
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
}

seedData();

