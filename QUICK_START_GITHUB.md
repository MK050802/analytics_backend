# Quick Start: GitHub & Deployment

## 🚀 Step-by-Step Guide

### Step 1: Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `analytics-backend`
3. Description: "Unified Event Analytics Engine for Web and Mobile Apps"
4. **DO NOT** check "Initialize with README"
5. Click "Create repository"

### Step 2: Push Code to GitHub

**Windows (PowerShell):**
```powershell
# Run automated setup
.\scripts\setup-github.ps1

# Or manually:
git init
git add .
git commit -m "chore: initial project scaffold"
git remote add origin https://github.com/YOUR_USERNAME/analytics-backend.git
git branch -M main
git push -u origin main
```

**Linux/Mac:**
```bash
# Run automated setup
chmod +x scripts/setup-github.sh
./scripts/setup-github.sh

# Or manually:
git init
git add .
git commit -m "chore: initial project scaffold"
git remote add origin https://github.com/YOUR_USERNAME/analytics-backend.git
git branch -M main
git push -u origin main
```

### Step 3: Deploy to Vercel

1. **Sign up/Login:**
   - Go to https://vercel.com
   - Sign in with GitHub

2. **Import Project:**
   - Click "Add New Project"
   - Select your `analytics-backend` repository
   - Click "Import"

3. **Configure:**
   - Framework Preset: **Other**
   - Root Directory: `./` (default)
   - Build Command: (leave empty)
   - Output Directory: (leave empty)
   - Install Command: `npm install`

4. **Set Environment Variables:**
   Click "Environment Variables" and add:

   ```
   MYSQL_HOST=your-mysql-host.com
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

5. **Deploy:**
   - Click "Deploy"
   - Wait 2-3 minutes
   - Your API is live! 🎉

### Step 4: Get Database & Redis

**MySQL Options:**
- [PlanetScale](https://planetscale.com) - Free tier available
- [AWS RDS](https://aws.amazon.com/rds/) - Pay as you go
- [Google Cloud SQL](https://cloud.google.com/sql) - Free tier available

**Redis Options:**
- [Upstash](https://upstash.com) - Free tier, serverless-friendly ⭐ Recommended
- [Redis Cloud](https://redis.com/cloud/) - Free tier available

### Step 5: Test Your Live API

```bash
# Replace with your Vercel URL
curl https://your-project.vercel.app/health

# Register an app
curl -X POST https://your-project.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name": "My App", "description": "Test"}'
```

## ✅ Verification Checklist

- [ ] Code pushed to GitHub
- [ ] `.env` file NOT in repository (check with `git status`)
- [ ] Vercel deployment successful
- [ ] Environment variables set in Vercel
- [ ] MySQL database accessible
- [ ] Health check endpoint works
- [ ] Swagger docs accessible at `/docs`

## 🎯 Your Live API URLs

After deployment, you'll have:
- **API Base**: `https://your-project.vercel.app`
- **Health Check**: `https://your-project.vercel.app/health`
- **API Docs**: `https://your-project.vercel.app/docs`

## 🆘 Need Help?

- See [GITHUB_SETUP.md](./GITHUB_SETUP.md) for detailed instructions
- See [README.md](./README.md) for full documentation
- Check Vercel logs if deployment fails

---

**That's it! Your analytics backend is now live on the internet! 🚀**

