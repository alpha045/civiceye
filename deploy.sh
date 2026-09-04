#!/usr/bin/env bash
set -e

echo "=========================================="
echo "   CivicEye - Automated Vercel Deploy     "
echo "=========================================="

# Check if node is installed
if ! command -v node >/dev/null 2>&1; then
  echo "❌ Error: Node.js is required but not installed."
  exit 1
fi

echo "📦 Step 1: Building frontend bundle..."
cd frontend
npm install
npm run build
cd ..

echo ""
echo "🚀 Step 2: Deploying to Vercel..."
echo "If this is your first time deploying:"
echo "  1. Log in if prompted"
echo "  2. Confirm project name (e.g. civiceye)"
echo "  3. Keep default settings"
echo ""

# Run vercel deploy in production mode
npx -y vercel --prod

echo ""
echo "✅ Deployment finished successfully!"
echo "⚠️ Note: Remember to configure Environment Variables in your Vercel Project Dashboard"
echo "   Settings -> Environment Variables (MONGO_URI, JWT_SECRET, CLOUDINARY, etc.)"
echo "=========================================="
