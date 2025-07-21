# PowerShell Setup Script for AI Pricelist Monitor
# Run this script as Administrator

Write-Host "Setting up AI Pricelist Monitor for Windows..." -ForegroundColor Green

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "Node.js not found. Please install Node.js 18 or later from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Check if Git is installed
try {
    $gitVersion = git --version
    Write-Host "Git version: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "Git not found. Please install Git from https://git-scm.com/" -ForegroundColor Red
    exit 1
}

# Install dependencies
Write-Host "Installing dependencies..." -ForegroundColor Yellow
npm install

# Create tmp directory for file uploads
if (!(Test-Path "tmp")) {
    New-Item -ItemType Directory -Force -Path "tmp"
    Write-Host "Created tmp directory for file uploads" -ForegroundColor Green
}

# Copy environment template
if (!(Test-Path ".env.local")) {
    Copy-Item ".env.template" ".env.local"
    Write-Host "Created .env.local from template" -ForegroundColor Green
    Write-Host "Please edit .env.local with your actual environment variables" -ForegroundColor Yellow
}

# Build the application
Write-Host "Building application..." -ForegroundColor Yellow
npm run build

Write-Host "Setup completed!" -ForegroundColor Green
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Edit .env.local with your Supabase credentials" -ForegroundColor White
Write-Host "2. Run 'npm run dev' to start development server" -ForegroundColor White
Write-Host "3. Run 'vercel' to deploy to production" -ForegroundColor White