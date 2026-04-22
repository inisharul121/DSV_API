#!/bin/bash

# Configuration
SOURCE_BACKEND="backend"
SOURCE_FRONTEND="frontend"
MONOLITH_DIR="monolith"
ZIP_NAME="limbercargo_production_deploy.zip"

echo "🚀 Starting Limbercargo Monolith Sync..."
echo ""

# 0. CRITICAL: Build Vite frontend locally
echo "🔨 Building Frontend locally..."
cd "$SOURCE_FRONTEND"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
  echo "📦 Installing frontend dependencies..."
  npm install
fi

# Build Vite
echo "⚙️ Running: npm run build"
npm run build

if [ $? -ne 0 ]; then
  echo "❌ Frontend build failed! Fix errors above and try again."
  exit 1
fi

echo "✅ Frontend build successful!"
cd ..
echo ""

# 0. Clean up previous monolith junk
echo "🧹 Cleaning previous build artifacts..."
rm -rf "$MONOLITH_DIR/node_modules" "$MONOLITH_DIR/frontend/node_modules" "$MONOLITH_DIR/backend/node_modules"

# 1. Clear and Sync Backend Source
echo "📦 Preparing Backend structure..."
rsync -av --delete "$SOURCE_BACKEND/" "$MONOLITH_DIR/backend/" \
    --exclude "node_modules" \
    --exclude "public/labels/*" \
    --exclude "public/invoices/*" \
    --exclude ".env" \
    --exclude "*.sql"

# 1.1 Copy built frontend to backend/public (The Monolith Bridge)
echo "📁 Copying built frontend to backend/public..."
mkdir -p "$MONOLITH_DIR/backend/public"
cp -r "$SOURCE_FRONTEND/dist/"* "$MONOLITH_DIR/backend/public/"

# 2. Sync Frontend (Source and dist)
echo "📦 Syncing Frontend Files..."
rsync -av --delete "$SOURCE_FRONTEND/" "$MONOLITH_DIR/frontend/" \
    --exclude "node_modules" \
    --exclude ".env*"

# 3. Handle Production Environment File
echo "📦 NOTE: Auto-generation of .env and .htaccess has been removed."
echo "   Please manage these files manually in your cPanel File Manager."

# Copy root supporting files
[ -f "package.json" ] && cp package.json "$MONOLITH_DIR/"
[ -f "monolith/package.json" ] && cp monolith/package.json "$MONOLITH_DIR/"

# 4. Create the Deployment ZIP
echo "🗜️ Creating Deployment ZIP..."
rm -f "$ZIP_NAME"

cd "$MONOLITH_DIR" && zip -r "../$ZIP_NAME" . \
    -x "**/node_modules/*" \
    -x "**/.git/*" \
    -x "**/.env.local" \
    -x "**/.env.development" \
    -x "**/.env"
cd ..

echo ""
echo "✅ DONE! Your production deployment package is ready: $ZIP_NAME"
echo ""
echo "📊 Package Contents:"
echo "   ✓ Backend source code"
echo "   ✓ Frontend source and dist folder"
echo "   ⚠  NO .env file (Manage manually in cPanel)"
echo ""
echo "📦 Size: $(du -sh "$ZIP_NAME" | cut -f1)"
echo ""
echo "🚀 Next Steps (SSH Deployment):"
echo "   1. Upload $ZIP_NAME to cPanel (/home/bcicz/public_html/limbercargo)"
echo "   2. SSH into your server: ssh bcicz_limbercarg@www.limbercargo.com"
echo "   3. **CRITICAL**: Delete old app first: pm2 delete limbercargo-production"
echo "   4. Extract the package: unzip -o $ZIP_NAME -d ."
echo "   5. Install dependencies:"
echo "      cd ~/public_html/limbercargo/backend && npm install --production"
echo "   6. Start with PM2 using ABSOLUTE path to avoid .trash issues:"
echo "      pm2 start /home/bcicz/public_html/limbercargo/backend/src/app.js --name \"limbercargo-production\" --max-memory-restart 200M -- --max-old-space-size=200"
echo ""
echo "💡 PM2 Monitoring:"
echo "   - Status: pm2 status"
echo "   - Logs:   pm2 logs limbercargo-production"
echo "   - Stop:   pm2 stop limbercargo-production"
echo ""


