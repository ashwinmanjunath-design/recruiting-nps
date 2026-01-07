#!/bin/bash

# Firebase Hosting Deployment Script
# Usage: ./deploy-firebase.sh

set -e

echo "🚀 Deploying to Firebase Hosting..."
echo ""

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found. Installing..."
    npm install -g firebase-tools
fi

# Check if logged in
if ! firebase projects:list &> /dev/null; then
    echo "⚠️  Not logged in to Firebase. Please run: firebase login"
    exit 1
fi

# Build the project
echo "📦 Building frontend..."
npm run build

# Check if dist folder exists
if [ ! -d "dist" ]; then
    echo "❌ Build failed - dist folder not found"
    exit 1
fi

echo "✅ Build complete!"
echo ""

# Deploy to Firebase
echo "🌐 Deploying to Firebase..."
firebase deploy --only hosting

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📋 Next steps:"
echo "1. Copy your Firebase URL (shown above)"
echo "2. Update backend/.env: FRONTEND_URL=https://your-app.web.app"
echo "3. Restart backend"
echo "4. Send new survey emails - links will now work for external users!"
echo ""

