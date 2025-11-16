#!/bin/bash

# GitHub Repository Setup Script
# This script helps you initialize git and prepare for GitHub

echo "🚀 GitHub Repository Setup"
echo "=========================="
echo ""

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed. Please install Git first."
    exit 1
fi

# Check if already a git repository
if [ -d ".git" ]; then
    echo "⚠️  Git repository already initialized."
    read -p "Do you want to continue? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Initialize git if not already done
if [ ! -d ".git" ]; then
    echo "📦 Initializing git repository..."
    git init
    echo "✅ Git repository initialized"
fi

# Check if .env exists and is tracked
if [ -f ".env" ]; then
    if git ls-files --error-unmatch .env &> /dev/null; then
        echo "⚠️  WARNING: .env file is tracked by git!"
        echo "Removing .env from git tracking (file will remain locally)..."
        git rm --cached .env
    fi
fi

# Add all files
echo "📝 Adding files to git..."
git add .

# Show what will be committed
echo ""
echo "📋 Files to be committed:"
git status --short

echo ""
read -p "Enter your GitHub username: " GITHUB_USERNAME
read -p "Enter your repository name (default: analytics-backend): " REPO_NAME
REPO_NAME=${REPO_NAME:-analytics-backend}

# Create initial commit
echo ""
echo "💾 Creating initial commit..."
git commit -m "chore: initial project scaffold

- Express.js backend with MySQL and Redis
- Authentication and API key management
- Event collection and analytics endpoints
- Docker and Vercel deployment configuration
- Swagger API documentation
- Comprehensive test suite"

echo "✅ Initial commit created"

# Add remote
echo ""
echo "🔗 Adding remote repository..."
GITHUB_URL="https://github.com/${GITHUB_USERNAME}/${REPO_NAME}.git"
git remote add origin $GITHUB_URL 2>/dev/null || git remote set-url origin $GITHUB_URL

echo "✅ Remote added: $GITHUB_URL"

# Set main branch
git branch -M main

echo ""
echo "✅ Setup complete!"
echo ""
echo "📝 Next steps:"
echo "1. Create the repository on GitHub:"
echo "   https://github.com/new"
echo "   Repository name: $REPO_NAME"
echo "   DO NOT initialize with README, .gitignore, or license"
echo ""
echo "2. Push to GitHub:"
echo "   git push -u origin main"
echo ""
echo "3. Deploy to Vercel:"
echo "   - Go to https://vercel.com"
echo "   - Import your GitHub repository"
echo "   - Set environment variables"
echo "   - Deploy!"
echo ""

