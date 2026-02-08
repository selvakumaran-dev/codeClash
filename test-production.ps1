# Test production build locally (PowerShell)

Write-Host "🧪 Testing Production Build Locally..." -ForegroundColor Cyan
Write-Host ""

# Set production environment
$env:NODE_ENV = "production"
$env:PORT = "3001"
$env:CORS_ORIGIN = "*"
$env:PISTON_API_URL = "https://emkc.org/api/v2/piston"

Write-Host "📦 Building frontend..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Frontend build failed!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Frontend build complete!" -ForegroundColor Green
Write-Host ""

Write-Host "📦 Installing server dependencies..." -ForegroundColor Yellow
Set-Location server
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Server dependency installation failed!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Server dependencies installed!" -ForegroundColor Green
Write-Host ""

Write-Host "🚀 Starting production server..." -ForegroundColor Cyan
Write-Host "   Server will serve frontend from ../dist" -ForegroundColor Gray
Write-Host "   Access at: http://localhost:3001" -ForegroundColor Green
Write-Host ""
Write-Host "   Press Ctrl+C to stop" -ForegroundColor Yellow
Write-Host ""

npm start
