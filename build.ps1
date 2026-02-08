# Build script for production deployment
Write-Host "🚀 Building CodeClash for Production..." -ForegroundColor Cyan

# Build frontend
Write-Host "`n📦 Building frontend..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Frontend build failed!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Frontend build complete!" -ForegroundColor Green

# Install server dependencies
Write-Host "`n📦 Installing server dependencies..." -ForegroundColor Yellow
Set-Location server
npm install --production

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Server dependency installation failed!" -ForegroundColor Red
    exit 1
}

Set-Location ..

Write-Host "`n✅ Build complete! Ready for deployment." -ForegroundColor Green
Write-Host "📁 Frontend build: ./dist" -ForegroundColor Cyan
Write-Host "🖥️  Server: ./server" -ForegroundColor Cyan
