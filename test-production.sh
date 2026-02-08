#!/bin/bash
# Test production build locally

echo "🧪 Testing Production Build Locally..."
echo ""

# Set production environment
export NODE_ENV=production
export PORT=3001
export CORS_ORIGIN="*"
export PISTON_API_URL="https://emkc.org/api/v2/piston"

echo "📦 Building frontend..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Frontend build failed!"
    exit 1
fi

echo "✅ Frontend build complete!"
echo ""

echo "📦 Installing server dependencies..."
cd server
npm install

if [ $? -ne 0 ]; then
    echo "❌ Server dependency installation failed!"
    exit 1
fi

echo "✅ Server dependencies installed!"
echo ""

echo "🚀 Starting production server..."
echo "   Server will serve frontend from ../dist"
echo "   Access at: http://localhost:3001"
echo ""
echo "   Press Ctrl+C to stop"
echo ""

npm start
