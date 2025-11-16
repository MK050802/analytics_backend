# GitHub Repository Setup Script for Windows PowerShell
# This script helps you initialize git and prepare for GitHub

Write-Host "🚀 GitHub Repository Setup" -ForegroundColor Cyan
Write-Host "==========================" -ForegroundColor Cyan
Write-Host ""

# Check if git is installed
try {
    $null = git --version
} catch {
    Write-Host "❌ Git is not installed. Please install Git first." -ForegroundColor Red
    exit 1
}

# Check if already a git repository
if (Test-Path ".git") {
    Write-Host "⚠️  Git repository already initialized." -ForegroundColor Yellow
    $continue = Read-Host "Do you want to continue? (y/n)"
    if ($continue -ne "y" -and $continue -ne "Y") {
        exit 1
    }
}

# Initialize git if not already done
if (-not (Test-Path ".git")) {
    Write-Host "📦 Initializing git repository..." -ForegroundColor Green
    git init
    Write-Host "✅ Git repository initialized" -ForegroundColor Green
}

# Check if .env exists and is tracked
if (Test-Path ".env") {
    $envTracked = git ls-files --error-unmatch .env 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "⚠️  WARNING: .env file is tracked by git!" -ForegroundColor Yellow
        Write-Host "Removing .env from git tracking (file will remain locally)..." -ForegroundColor Yellow
        git rm --cached .env
    }
}

# Add all files
Write-Host "📝 Adding files to git..." -ForegroundColor Green
git add .

# Show what will be committed
Write-Host ""
Write-Host "📋 Files to be committed:" -ForegroundColor Cyan
git status --short

Write-Host ""
$GITHUB_USERNAME = Read-Host "Enter your GitHub username"
$REPO_NAME = Read-Host "Enter your repository name (default: analytics-backend)"
if ([string]::IsNullOrWhiteSpace($REPO_NAME)) {
    $REPO_NAME = "analytics-backend"
}

# Create initial commit
Write-Host ""
Write-Host "💾 Creating initial commit..." -ForegroundColor Green
$commitMessage = @"
chore: initial project scaffold

- Express.js backend with MySQL and Redis
- Authentication and API key management
- Event collection and analytics endpoints
- Docker and Vercel deployment configuration
- Swagger API documentation
- Comprehensive test suite
"@

git commit -m $commitMessage

Write-Host "✅ Initial commit created" -ForegroundColor Green

# Add remote
Write-Host ""
Write-Host "🔗 Adding remote repository..." -ForegroundColor Green
$GITHUB_URL = "https://github.com/${GITHUB_USERNAME}/${REPO_NAME}.git"

try {
    git remote add origin $GITHUB_URL
} catch {
    git remote set-url origin $GITHUB_URL
}

Write-Host "✅ Remote added: $GITHUB_URL" -ForegroundColor Green

# Set main branch
git branch -M main

Write-Host ""
Write-Host "✅ Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Next steps:" -ForegroundColor Cyan
Write-Host "1. Create the repository on GitHub:"
Write-Host "   https://github.com/new"
Write-Host "   Repository name: $REPO_NAME"
Write-Host "   DO NOT initialize with README, .gitignore, or license"
Write-Host ""
Write-Host "2. Push to GitHub:"
Write-Host "   git push -u origin main"
Write-Host ""
Write-Host "3. Deploy to Vercel:"
Write-Host "   - Go to https://vercel.com"
Write-Host "   - Import your GitHub repository"
Write-Host "   - Set environment variables"
Write-Host "   - Deploy!"
Write-Host ""

