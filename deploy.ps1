# PowerShell Deployment Script for LoanHub Kenya
# This script helps deploy the application to Netlify

Write-Host "🚀 LoanHub Kenya Deployment Script" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: package.json not found. Please run this script from the project root directory." -ForegroundColor Red
    exit 1
}

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Error: Node.js is not installed. Please install Node.js first." -ForegroundColor Red
    exit 1
}

# Check if npm is installed
try {
    $npmVersion = npm --version
    Write-Host "✅ npm version: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Error: npm is not installed. Please install npm first." -ForegroundColor Red
    exit 1
}

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error: Failed to install dependencies." -ForegroundColor Red
    exit 1
}

# Run linting
Write-Host "🔍 Running linting..." -ForegroundColor Yellow
npm run lint
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Warning: Linting found issues, but continuing with build..." -ForegroundColor Yellow
}

# Build the application
Write-Host "🔨 Building application..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error: Build failed." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Build completed successfully!" -ForegroundColor Green

# Check if Netlify CLI is installed
try {
    $netlifyVersion = netlify --version
    Write-Host "✅ Netlify CLI version: $netlifyVersion" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Netlify CLI not found. Installing..." -ForegroundColor Yellow
    npm install -g netlify-cli
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Error: Failed to install Netlify CLI." -ForegroundColor Red
        exit 1
    }
}

# Deploy to Netlify
Write-Host "🌐 Deploying to Netlify..." -ForegroundColor Yellow
Write-Host "Please make sure you have:" -ForegroundColor Cyan
Write-Host "1. Created a Netlify account" -ForegroundColor Cyan
Write-Host "2. Set up your environment variables in Netlify dashboard" -ForegroundColor Cyan
Write-Host "3. Connected your GitHub repository to Netlify" -ForegroundColor Cyan
Write-Host ""

$deployChoice = Read-Host "Do you want to deploy now? (y/n)"
if ($deployChoice -eq "y" -or $deployChoice -eq "Y") {
    netlify deploy --prod
    if ($LASTEXITCODE -eq 0) {
        Write-Host "🎉 Deployment completed successfully!" -ForegroundColor Green
        Write-Host "Your application is now live!" -ForegroundColor Green
    } else {
        Write-Host "❌ Deployment failed. Please check the error messages above." -ForegroundColor Red
    }
} else {
    Write-Host "📋 Manual deployment steps:" -ForegroundColor Cyan
    Write-Host "1. Push your code to GitHub" -ForegroundColor White
    Write-Host "2. Connect your repository to Netlify" -ForegroundColor White
    Write-Host "3. Set environment variables in Netlify dashboard" -ForegroundColor White
    Write-Host "4. Deploy!" -ForegroundColor White
}

Write-Host ""
Write-Host "📚 For more information, see DEPLOYMENT_GUIDE.md" -ForegroundColor Cyan