#!/bin/bash
# Build script for production deployment (Linux/Mac)

echo "🚀 Building CodeClash for Production..."

# Build frontend
echo ""
echo "📦 Building frontend..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Frontend build failed!"
    exit 1
fi

echo "✅ Frontend build complete!"

# Install server dependencies
echo ""
echo "📦 Installing server dependencies..."
cd server
npm install --production

if [ $? -ne 0 ]; then
    echo "❌ Server dependency installation failed!"
    exit 1
fi

cd ..

echo ""
echo "✅ Build complete! Ready for deployment."
echo "📁 Frontend build: ./dist"
echo "🖥️  Server: ./server"
