@echo off
REM Monolith cPanel Deployment Helper Script (Windows)
REM Run this after extracting the monolith folder locally before uploading to cPanel

echo.
echo 🚀 DSV API Monolith - Setup Script (Windows)
echo =============================================
echo.

REM Check Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js version: 
node --version
echo ✅ npm version:
npm --version
echo.

REM Step 1: Install all dependencies
echo 📦 Installing dependencies...
call npm run install-all

if errorlevel 1 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

echo ✅ Dependencies installed successfully
echo.

REM Step 2: Build frontend
echo 🔨 Building frontend...
call npm run build

if errorlevel 1 (
    echo ❌ Frontend build failed
    pause
    exit /b 1
)

echo ✅ Frontend build successful
echo.

REM Step 3: Create .env if it doesn't exist
if not exist "backend\.env" (
    echo 📝 Creating backend\.env file...
    (
        echo NODE_ENV=production
        echo PORT=3000
        echo # Add your environment variables here:
        echo # DATABASE_URL=
        echo # DSV_API_KEY=
        echo # etc.
    ) > backend\.env
    echo ⚠️  Please update backend\.env with your environment variables
) else (
    echo ✅ backend\.env already exists
)

echo.
echo ✨ Setup Complete!
echo.
echo Next steps:
echo 1. Update backend\.env with your production credentials
echo 2. Test locally: cd backend ^&^& npm start
echo 3. Upload monolith folder to cPanel
echo 4. Configure cPanel Node.js app to run: backend/src/app.js
echo 5. Set the listening port (usually 3000^)
echo 6. Start the application via cPanel
echo.
echo Happy deploying! 🎉
echo.
pause
