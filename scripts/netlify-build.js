#!/usr/bin/env node

// Netlify build script to handle path issues with special characters
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 Starting Netlify build process...');

try {
  // Set environment variables for build
  process.env.NODE_ENV = 'production';
  process.env.NEXT_TELEMETRY_DISABLED = '1';
  
  // Create a temporary directory with a clean path
  const tempDir = path.join(process.cwd(), 'temp-build');
  
  if (fs.existsSync(tempDir)) {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
  
  fs.mkdirSync(tempDir, { recursive: true });
  
  console.log('📦 Installing dependencies...');
  
  // Install dependencies (use npm install instead of npm ci to avoid lock file issues)
  execSync('npm install', { 
    stdio: 'inherit',
    cwd: process.cwd()
  });
  
  console.log('🔨 Building Next.js application...');
  
  // Build the application
  execSync('npm run build', { 
    stdio: 'inherit',
    cwd: process.cwd()
  });
  
  console.log('✅ Build completed successfully!');
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
