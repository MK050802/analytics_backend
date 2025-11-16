/**
 * Verification script to check if project is ready
 * Run: node scripts/verify-setup.js
 */

const fs = require('fs');
const path = require('path');

const requiredFiles = [
  'package.json',
  'schema.sql',
  'Dockerfile',
  'docker-compose.yml',
  'vercel.json',
  '.env.example',
  'README.md',
  'src/index.js',
  'src/server.js',
  'src/config/db.js',
  'src/config/redis.js',
  'src/utils/keygen.js',
  'src/middlewares/apiKeyAuth.js',
  'src/middlewares/rateLimiter.js',
  'src/controllers/auth.controller.js',
  'src/controllers/analytics.controller.js',
  'src/controllers/shorturl.controller.js',
  'src/routes/auth.routes.js',
  'src/routes/analytics.routes.js',
  'src/routes/shorturl.routes.js',
  'src/swagger.js',
  'tests/api.test.js',
];

const requiredDirs = [
  'src',
  'src/config',
  'src/controllers',
  'src/middlewares',
  'src/routes',
  'src/utils',
  'tests',
  'scripts',
];

console.log('🔍 Verifying project setup...\n');

let errors = [];
let warnings = [];

// Check required directories
console.log('📁 Checking directories...');
requiredDirs.forEach((dir) => {
  if (!fs.existsSync(dir)) {
    errors.push(`Missing directory: ${dir}`);
  } else {
    console.log(`  ✅ ${dir}`);
  }
});

// Check required files
console.log('\n📄 Checking files...');
requiredFiles.forEach((file) => {
  if (!fs.existsSync(file)) {
    errors.push(`Missing file: ${file}`);
  } else {
    console.log(`  ✅ ${file}`);
  }
});

// Check package.json
console.log('\n📦 Checking package.json...');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  const requiredDeps = [
    'express',
    'mysql2',
    'redis',
    'express-rate-limit',
    'swagger-jsdoc',
    'swagger-ui-express',
    'uuid',
    'cors',
    'helmet',
    'dotenv',
  ];
  
  const requiredDevDeps = ['jest', 'supertest', 'nodemon', 'cross-env'];
  
  requiredDeps.forEach((dep) => {
    if (!packageJson.dependencies || !packageJson.dependencies[dep]) {
      errors.push(`Missing dependency: ${dep}`);
    } else {
      console.log(`  ✅ ${dep}`);
    }
  });
  
  requiredDevDeps.forEach((dep) => {
    if (!packageJson.devDependencies || !packageJson.devDependencies[dep]) {
      warnings.push(`Missing dev dependency: ${dep}`);
    } else {
      console.log(`  ✅ ${dep} (dev)`);
    }
  });
  
  // Check scripts
  const requiredScripts = ['dev', 'start', 'test'];
  requiredScripts.forEach((script) => {
    if (!packageJson.scripts || !packageJson.scripts[script]) {
      errors.push(`Missing script: ${script}`);
    } else {
      console.log(`  ✅ script: ${script}`);
    }
  });
} catch (error) {
  errors.push(`Error reading package.json: ${error.message}`);
}

// Check .env.example
console.log('\n🔐 Checking .env.example...');
if (fs.existsSync('.env.example')) {
  const envExample = fs.readFileSync('.env.example', 'utf8');
  const requiredVars = [
    'MYSQL_HOST',
    'MYSQL_USER',
    'MYSQL_PASSWORD',
    'MYSQL_DATABASE',
  ];
  
  requiredVars.forEach((varName) => {
    if (!envExample.includes(varName)) {
      warnings.push(`Missing env variable in .env.example: ${varName}`);
    } else {
      console.log(`  ✅ ${varName}`);
    }
  });
} else {
  errors.push('Missing .env.example file');
}

// Check .env (should exist but not be committed)
console.log('\n🔒 Checking .env...');
if (fs.existsSync('.env')) {
  console.log('  ✅ .env file exists');
} else {
  warnings.push('.env file not found (create from .env.example)');
}

// Check .gitignore
console.log('\n🚫 Checking .gitignore...');
if (fs.existsSync('.gitignore')) {
  const gitignore = fs.readFileSync('.gitignore', 'utf8');
  if (!gitignore.includes('.env')) {
    warnings.push('.env should be in .gitignore');
  } else {
    console.log('  ✅ .env in .gitignore');
  }
  
  if (!gitignore.includes('node_modules')) {
    warnings.push('node_modules should be in .gitignore');
  } else {
    console.log('  ✅ node_modules in .gitignore');
  }
} else {
  warnings.push('.gitignore file not found');
}

// Check schema.sql
console.log('\n🗄️  Checking schema.sql...');
if (fs.existsSync('schema.sql')) {
  const schema = fs.readFileSync('schema.sql', 'utf8');
  const requiredTables = ['apps', 'api_keys', 'events'];
  requiredTables.forEach((table) => {
    // Check for table name in CREATE TABLE statements
    const tableRegex = new RegExp(`CREATE TABLE.*${table}`, 'i');
    if (!tableRegex.test(schema)) {
      errors.push(`Missing table in schema: ${table}`);
    } else {
      console.log(`  ✅ Table: ${table}`);
    }
  });
} else {
  errors.push('Missing schema.sql file');
}

// Summary
console.log('\n' + '='.repeat(50));
console.log('📊 VERIFICATION SUMMARY');
console.log('='.repeat(50));

if (errors.length === 0 && warnings.length === 0) {
  console.log('\n✅ All checks passed! Project is ready to upload.');
  process.exit(0);
} else {
  if (errors.length > 0) {
    console.log('\n❌ ERRORS (must fix before upload):');
    errors.forEach((error) => console.log(`  - ${error}`));
  }
  
  if (warnings.length > 0) {
    console.log('\n⚠️  WARNINGS (recommended to fix):');
    warnings.forEach((warning) => console.log(`  - ${warning}`));
  }
  
  console.log('\n⚠️  Please fix the issues above before uploading.');
  process.exit(errors.length > 0 ? 1 : 0);
}

