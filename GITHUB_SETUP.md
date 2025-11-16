# GitHub Repository Setup & Deployment Guide

## 📦 Step 1: Create GitHub Repository

### Option A: Using GitHub Web Interface

1. Go to [GitHub.com](https://github.com) and sign in
2. Click the **"+"** icon in the top right → **"New repository"**
3. Fill in details:
   - **Repository name**: `analytics-backend` (or your preferred name)
   - **Description**: "Unified Event Analytics Engine for Web and Mobile Apps"
   - **Visibility**: Public or Private (your choice)
   - **DO NOT** initialize with README, .gitignore, or license (we already have these)
4. Click **"Create repository"**

### Option B: Using GitHub CLI

```bash
# Install GitHub CLI first: https://cli.github.com/
gh repo create analytics-backend --public --description "Unified Event Analytics Engine for Web and Mobile Apps"
```

## 🔧 Step 2: Initialize Git and Push to GitHub

```bash
# 1. Initialize git (if not already done)
git init

# 2. Add all files
git add .

# 3. Create initial commit
git commit -m "chore: initial project scaffold

- Express.js backend with MySQL and Redis
- Authentication and API key management
- Event collection and analytics endpoints
- Docker and Vercel deployment configuration
- Swagger API documentation
- Comprehensive test suite"

# 4. Add remote repository (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/analytics-backend.git

# 5. Push to GitHub
git branch -M main
git push -u origin main
```

## ✅ Step 3: Verify What's Being Committed

**Important**: Before pushing, verify these files are NOT committed:

```bash
# Check what will be committed
git status

# Verify .env is ignored
git check-ignore .env

# If .env is tracked, remove it:
git rm --cached .env
```

**Files that SHOULD be committed:**
- ✅ All source code (`src/`)
- ✅ `package.json`, `package-lock.json`
- ✅ `schema.sql`
- ✅ `Dockerfile`, `docker-compose.yml`
- ✅ `vercel.json`
- ✅ `.env.example` (template only)
- ✅ `README.md`
- ✅ `tests/`
- ✅ `.gitignore`

**Files that SHOULD NOT be committed:**
- ❌ `.env` (contains secrets)
- ❌ `node_modules/` (install with npm)
- ❌ `coverage/` (test coverage reports)
- ❌ `*.log` (log files)

## 🚀 Step 4: Deployment Options

### Option A: Deploy to Vercel (Recommended - Already Configured)

#### 4.1 Connect GitHub to Vercel

1. Go to [Vercel.com](https://vercel.com) and sign in with GitHub
2. Click **"Add New Project"**
3. Import your `analytics-backend` repository
4. Configure project:
   - **Framework Preset**: Other
   - **Root Directory**: `./` (default)
   - **Build Command**: Leave empty (no build needed)
   - **Output Directory**: Leave empty
   - **Install Command**: `npm install`

#### 4.2 Set Environment Variables in Vercel

In Vercel Dashboard → Your Project → Settings → Environment Variables:

Add these variables:

```
MYSQL_HOST=your-mysql-host.com
MYSQL_PORT=3306
MYSQL_USER=your-database-user
MYSQL_PASSWORD=your-secure-password
MYSQL_DATABASE=analytics_db
UPSTASH_REDIS_URL=redis://default:password@host:port
CACHE_TTL_SEC=300
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
NODE_ENV=production
API_PREFIX=/api
```

**Where to get MySQL/Redis:**
- **MySQL**: Use [PlanetScale](https://planetscale.com), [AWS RDS](https://aws.amazon.com/rds/), or [Google Cloud SQL](https://cloud.google.com/sql)
- **Redis**: Use [Upstash](https://upstash.com) (serverless-friendly) or [Redis Cloud](https://redis.com/cloud/)

#### 4.3 Deploy

1. Click **"Deploy"**
2. Wait for deployment to complete
3. Your API will be live at: `https://your-project.vercel.app`

#### 4.4 Update README with Live URL

After deployment, update your README.md with the live API URL.

### Option B: Deploy to Railway

1. Go to [Railway.app](https://railway.app)
2. Sign in with GitHub
3. Click **"New Project"** → **"Deploy from GitHub repo"**
4. Select your repository
5. Add MySQL and Redis services
6. Set environment variables
7. Deploy

### Option C: Deploy to Render

1. Go to [Render.com](https://render.com)
2. Sign in with GitHub
3. Click **"New"** → **"Web Service"**
4. Connect your repository
5. Configure:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
6. Add MySQL and Redis services
7. Set environment variables
8. Deploy

### Option D: Deploy to AWS/GCP/Azure

For production deployments, consider:
- **AWS**: Elastic Beanstalk, ECS, or Lambda
- **GCP**: Cloud Run or App Engine
- **Azure**: App Service or Container Instances

## 🔄 Step 5: Set Up CI/CD (Optional but Recommended)

### GitHub Actions for Automated Testing

Create `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      mysql:
        image: mysql:8.0
        env:
          MYSQL_ROOT_PASSWORD: rootpassword
          MYSQL_DATABASE: analytics_db_test
        ports:
          - 3306:3306
        options: >-
          --health-cmd="mysqladmin ping"
          --health-interval=10s
          --health-timeout=5s
          --health-retries=3
    
    steps:
    - uses: actions/checkout@v3
      
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run database migrations
      run: |
        mysql -h 127.0.0.1 -u root -prootpassword < schema.sql
    
    - name: Run tests
      env:
        NODE_ENV: test
        MYSQL_HOST: 127.0.0.1
        MYSQL_PORT: 3306
        MYSQL_USER: root
        MYSQL_PASSWORD: rootpassword
        MYSQL_DATABASE: analytics_db_test
      run: npm test
```

## 📝 Step 6: Add Repository Badges (Optional)

Add to your README.md:

```markdown
![GitHub](https://img.shields.io/github/license/YOUR_USERNAME/analytics-backend)
![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)
![MySQL](https://img.shields.io/badge/mysql-8.0+-blue)
![Vercel](https://img.shields.io/badge/deployed%20on-vercel-black)
```

## 🔐 Step 7: Security Best Practices

1. **Never commit secrets:**
   ```bash
   # Verify .env is in .gitignore
   cat .gitignore | grep .env
   ```

2. **Use GitHub Secrets for CI/CD:**
   - Go to Repository → Settings → Secrets and variables → Actions
   - Add secrets for database credentials (if needed in CI)

3. **Enable Dependabot:**
   - Go to Repository → Settings → Security → Dependabot alerts
   - Enable automatic security updates

4. **Add Security Policy:**
   - Create `SECURITY.md` with security reporting instructions

## 📊 Step 8: Repository Structure

Your final repository should look like:

```
analytics-backend/
├── .github/
│   └── workflows/
│       └── ci.yml (optional)
├── src/
│   ├── config/
│   ├── controllers/
│   ├── middlewares/
│   ├── routes/
│   ├── utils/
│   ├── index.js
│   ├── server.js
│   └── swagger.js
├── tests/
│   └── api.test.js
├── scripts/
│   ├── seed-sample-data.js
│   └── verify-setup.js
├── .env.example
├── .gitignore
├── docker-compose.yml
├── Dockerfile
├── package.json
├── README.md
├── schema.sql
├── vercel.json
└── VERIFICATION_CHECKLIST.md
```

## 🎯 Quick Deployment Checklist

- [ ] GitHub repository created
- [ ] Code pushed to GitHub
- [ ] `.env` file NOT committed (check with `git status`)
- [ ] `.env.example` IS committed
- [ ] Vercel/Railway/Render account created
- [ ] Environment variables set in hosting platform
- [ ] MySQL database provisioned
- [ ] Redis provisioned (optional)
- [ ] Deployment successful
- [ ] API accessible at live URL
- [ ] Health check endpoint works
- [ ] Swagger docs accessible

## 🚨 Common Issues & Solutions

### Issue: "Cannot connect to MySQL"
- **Solution**: Check MySQL host allows connections from Vercel IPs
- **Solution**: Use connection pooling (already implemented)
- **Solution**: Verify environment variables are set correctly

### Issue: "Redis connection failed"
- **Solution**: Redis is optional - app works without it (caching disabled)
- **Solution**: If using Redis, verify UPSTASH_REDIS_URL format

### Issue: "Port already in use"
- **Solution**: Vercel handles ports automatically - no need to set PORT

### Issue: "Module not found"
- **Solution**: Ensure `package.json` has all dependencies
- **Solution**: Run `npm install` before deployment

## 📚 Additional Resources

- [GitHub Docs](https://docs.github.com)
- [Vercel Docs](https://vercel.com/docs)
- [MySQL Connection Pooling](https://github.com/sidorares/node-mysql2#using-connection-pools)
- [Upstash Redis](https://docs.upstash.com/redis)

---

**Ready to deploy? Follow the steps above and your analytics backend will be live! 🚀**

