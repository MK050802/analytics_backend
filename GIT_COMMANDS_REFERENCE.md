# Git Commands Reference for Cursor Terminal

## ✅ What We've Done So Far

```bash
git init                    # ✅ Initialized repository
git add .                   # ✅ Added all files
git commit -m "message"     # ✅ Created initial commit
```

## 📋 Common Git Commands You Can Use

### Check Status
```bash
git status                  # See what files changed
git log                     # View commit history
git log --oneline           # Compact commit history
```

### Add & Commit Changes
```bash
git add .                   # Add all changed files
git add filename.js         # Add specific file
git commit -m "message"     # Commit with message
git commit -am "message"    # Add and commit in one step
```

### Connect to GitHub

**1. Create repository on GitHub first:**
- Go to https://github.com/new
- Name: `analytics-backend`
- **DO NOT** initialize with README
- Click "Create repository"

**2. Then run these commands:**
```bash
# Add remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/analytics-backend.git

# Rename branch to main (if needed)
git branch -M main

# Push to GitHub
git push -u origin main
```

### Push Updates
```bash
git push                    # Push to GitHub
git push origin main    # Push to specific branch
```

### Pull Changes
```bash
git pull                    # Get latest changes from GitHub
git fetch                   # Download changes without merging
```

### View Changes
```bash
git diff                    # See what changed
git diff filename.js       # See changes in specific file
git show                    # Show last commit details
```

### Branch Management
```bash
git branch                  # List all branches
git branch new-branch       # Create new branch
git checkout branch-name    # Switch to branch
git checkout -b new-branch  # Create and switch to branch
```

### Undo Changes
```bash
git restore filename.js     # Discard changes in file
git restore .               # Discard all changes
git reset HEAD~1           # Undo last commit (keep changes)
```

### Check What Will Be Committed
```bash
git status                  # See staged and unstaged files
git diff --staged          # See what's staged for commit
```

## 🚀 Next Steps: Push to GitHub

### Step 1: Create GitHub Repository
1. Go to: https://github.com/new
2. Repository name: `analytics-backend`
3. Description: "Unified Event Analytics Engine"
4. **DO NOT** check "Initialize with README"
5. Click "Create repository"

### Step 2: Connect and Push
```bash
# Replace YOUR_USERNAME with your actual GitHub username
git remote add origin https://github.com/YOUR_USERNAME/analytics-backend.git

# Rename branch to main
git branch -M main

# Push to GitHub
git push -u origin main
```

### Step 3: Verify
- Go to your GitHub repository
- You should see all your files there!

## 🔍 Verify .env is NOT Committed

```bash
# This should return ".env" (meaning it's ignored)
git check-ignore .env

# Check if .env is in the repository
git ls-files | grep .env
# Should only show .env.example, NOT .env
```

## 📝 Making Future Changes

```bash
# 1. Make changes to files
# 2. Check what changed
git status

# 3. Add changes
git add .

# 4. Commit
git commit -m "feat: added new feature"

# 5. Push to GitHub
git push
```

## 🆘 Common Issues

### "fatal: remote origin already exists"
```bash
# Remove existing remote
git remote remove origin

# Add new remote
git remote add origin https://github.com/YOUR_USERNAME/analytics-backend.git
```

### "Permission denied"
- Make sure you're logged into GitHub
- Use HTTPS URL (not SSH) if you haven't set up SSH keys

### "Updates were rejected"
```bash
# Pull latest changes first
git pull origin main --rebase

# Then push
git push
```

## 💡 Pro Tips

1. **Always check status before committing:**
   ```bash
   git status
   ```

2. **Write descriptive commit messages:**
   ```bash
   git commit -m "feat: add user authentication"
   git commit -m "fix: resolve database connection issue"
   git commit -m "docs: update README with deployment steps"
   ```

3. **Commit often, push regularly:**
   - Commit after each feature/change
   - Push to GitHub daily or after major changes

4. **Never commit sensitive data:**
   - Always check `git status` before committing
   - Verify `.env` is in `.gitignore`

---

**Your repository is ready! Just connect it to GitHub and push! 🚀**

