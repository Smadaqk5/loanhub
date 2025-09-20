# deploy-to-netlify.ps1
# This script handles the deployment to Netlify, working around the directory path issue

Write-Host "Starting LoanHub Netlify Deployment..." -ForegroundColor Green

# Change to the loan-hub directory
Set-Location "loan-hub"

# 1. Install dependencies
Write-Host "Installing dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to install dependencies"
    exit 1
}

# 2. Clean previous builds
Write-Host "Cleaning previous builds..." -ForegroundColor Yellow
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force out -ErrorAction SilentlyContinue

# 3. Build the application
Write-Host "Building the application..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Error "Build failed. This might be due to the directory path containing special characters."
    Write-Host "Please move the project to a directory without special characters (like exclamation marks) and try again." -ForegroundColor Red
    exit 1
}

# 4. Check if Netlify CLI is installed
Write-Host "Checking Netlify CLI..." -ForegroundColor Yellow
try {
    netlify --version | Out-Null
    if ($LASTEXITCODE -ne 0) {
        throw "Netlify CLI not found"
    }
} catch {
    Write-Host "Installing Netlify CLI..." -ForegroundColor Yellow
    npm install -g netlify-cli
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to install Netlify CLI"
        exit 1
    }
}

# 5. Login to Netlify (if not already logged in)
Write-Host "Checking Netlify login status..." -ForegroundColor Yellow
netlify status --json | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Please log in to Netlify..." -ForegroundColor Yellow
    netlify login
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Netlify login failed"
        exit 1
    }
}

# 6. Deploy to Netlify
Write-Host "Deploying to Netlify..." -ForegroundColor Yellow
netlify deploy --prod --dir=out
if ($LASTEXITCODE -ne 0) {
    Write-Error "Deployment failed"
    exit 1
}

Write-Host "Deployment completed successfully!" -ForegroundColor Green
Write-Host "Your site should be live at the URL provided above." -ForegroundColor Green
