#!/usr/bin/env node

/**
 * Monolith Build Script
 * Builds the frontend and copies it to backend/public for cPanel deployment
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const FRONTEND_DIR = path.join(__dirname, 'frontend');
const BACKEND_PUBLIC_DIR = path.join(__dirname, 'backend', 'public');
const FRONTEND_BUILD_DIR = path.join(FRONTEND_DIR, 'dist');

console.log('🚀 Starting Monolith Build Process...\n');

try {
  // Step 1: Install frontend dependencies
  console.log('📦 Installing frontend dependencies...');
  execSync('npm install', { cwd: FRONTEND_DIR, stdio: 'inherit' });
  console.log('✅ Frontend dependencies installed\n');

  // Step 2: Build frontend
  console.log('🔨 Building frontend...');
  execSync('npm run build', { cwd: FRONTEND_DIR, stdio: 'inherit' });
  console.log('✅ Frontend built successfully\n');

  // Step 3: Clear existing public/dist contents (except for existing files you want to keep)
  console.log('🧹 Clearing old build files from backend/public...');
  const publicDirsToClean = ['css', 'js', 'images'];
  publicDirsToClean.forEach(dir => {
    const dirPath = path.join(BACKEND_PUBLIC_DIR, dir);
    if (fs.existsSync(dirPath)) {
      fs.rmSync(dirPath, { recursive: true, force: true });
    }
  });
  
  // Remove old HTML files
  ['index.html'].forEach(file => {
    const filePath = path.join(BACKEND_PUBLIC_DIR, file);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  });
  console.log('✅ Old build files removed\n');

  // Step 4: Copy frontend build to backend/public
  console.log('📁 Copying built frontend to backend/public...');
  if (fs.existsSync(FRONTEND_BUILD_DIR)) {
    const files = fs.readdirSync(FRONTEND_BUILD_DIR);
    files.forEach(file => {
      const srcPath = path.join(FRONTEND_BUILD_DIR, file);
      const destPath = path.join(BACKEND_PUBLIC_DIR, file);
      
      if (fs.statSync(srcPath).isDirectory()) {
        // Copy directories
        fs.cpSync(srcPath, destPath, { recursive: true, force: true });
      } else {
        // Copy files
        fs.copyFileSync(srcPath, destPath);
      }
    });
    console.log('✅ Frontend files copied successfully\n');
  } else {
    throw new Error(`Frontend build directory not found: ${FRONTEND_BUILD_DIR}`);
  }

  // Step 5: Success message
  console.log('✨ Build Complete!');
  console.log('📍 Frontend built and copied to: backend/public/');
  console.log('🎉 Ready for cPanel deployment!\n');
  console.log('Next steps:');
  console.log('1. Review changes in backend/public/');
  console.log('2. Deploy the monolith folder to cPanel');
  console.log('3. Ensure backend Node.js app serves static files from public/\n');

} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
