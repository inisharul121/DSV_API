#!/bin/bash

# Monolith cPanel Deployment Helper Script
# Run this after extracting the monolith folder on the cPanel server

echo "🚀 DSV API Monolith - Server Setup"
echo "===================================="
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed!"
    echo "Please install Node.js via cPanel first."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo "✅ npm version: $(npm --version)"
echo ""

# Step 1: Install all dependencies
echo "📦 Installing dependencies..."
npm run install-all

if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo ""

# Step 2: Build frontend
echo "🔨 Building frontend..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Frontend build successful"
else
    echo "❌ Frontend build failed"
    exit 1
fi

echo ""

# Step 3: Create .env if it doesn't exist
if [ ! -f "backend/.env" ]; then
    echo "📝 Creating backend/.env file..."
    cat > backend/.env << EOF
NODE_ENV=production
PORT=3000
# Add your environment variables here:
# DATABASE_URL=
# DSV_API_KEY=
# etc.
EOF
    echo "⚠️  Please update backend/.env with your environment variables"
else
    echo "✅ backend/.env already exists"
fi

echo ""
echo "✨ Setup Complete!"
echo ""
echo "Next steps:"
echo "1. Update backend/.env with your production credentials"
echo "2. Configure cPanel Node.js app to run: backend/src/app.js"
echo "3. Set the listening port (usually 3000)"
echo "4. Start the application via cPanel"
echo ""
echo "Testing locally:"
echo "  cd backend && npm start"
echo ""
echo "Happy deploying! 🎉"
