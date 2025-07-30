#!/bin/bash

# Quick Setup Script - Zero Configuration Start
# This script gets you running in seconds with sane defaults

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_header() {
    echo -e "${BLUE}[QUICK-SETUP]${NC} $1"
}

# Check if running from project root
if [ ! -f "package.json" ]; then
    echo "❌ This script must be run from the project root directory"
    exit 1
fi

print_header "🚀 Quick Setup - Getting you running in 30 seconds!"
echo ""

# Step 1: Install dependencies if needed
if [ ! -d "node_modules" ]; then
    print_status "Installing dependencies..."
    pnpm install
fi

# Step 2: Generate .env if it doesn't exist
if [ ! -f ".env" ]; then
    print_status "Generating environment configuration..."
    cp .env.example .env
    
    # Generate secure secrets
    JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
    TOTP_SECRET=$(node -e "
    const speakeasy = require('speakeasy');
    const secret = speakeasy.generateSecret({
        name: 'Next.js API Starter',
        issuer: 'Starter Template'
    });
    console.log(secret.base32);
    ")
    RANDOM_PASSWORD=$(node -e "console.log(require('crypto').randomBytes(16).toString('hex'))")
    
    # Update .env file
    sed -i.bak "s|JWT_SECRET=.*|JWT_SECRET=$JWT_SECRET|g" .env
    sed -i.bak "s|AUTH_2FA_SECRET=.*|AUTH_2FA_SECRET=$TOTP_SECRET|g" .env
    sed -i.bak "s|AUTH_PASSWORD=.*|AUTH_PASSWORD=$RANDOM_PASSWORD|g" .env
    rm .env.bak
    
    echo ""
    print_header "🔐 Your Generated Credentials:"
    echo "  Username: admin"
    echo "  Password: $RANDOM_PASSWORD"
    echo "  2FA Secret: $TOTP_SECRET"
    echo ""
    echo "  💡 Add the 2FA secret to Google Authenticator or similar app"
    echo ""
else
    print_status ".env already exists, skipping generation"
fi

# Step 3: Start MongoDB (hybrid approach)
print_status "Starting MongoDB container..."

# Stop existing container if running
docker stop mongodb-dev 2>/dev/null || true
docker rm mongodb-dev 2>/dev/null || true

# Start fresh MongoDB container
docker run -d --name mongodb-dev \
    -p 27017:27017 \
    -e MONGO_INITDB_ROOT_USERNAME=admin \
    -e MONGO_INITDB_ROOT_PASSWORD=password \
    -e MONGO_INITDB_DATABASE=nextjs-api \
    -v mongodb_data:/data/db \
    mongo:7-jammy > /dev/null

# Update .env with authenticated connection string
sed -i.bak "s|MONGODB_URI=.*|MONGODB_URI=mongodb://admin:password@localhost:27017/nextjs-api?authSource=admin|g" .env
rm .env.bak

print_status "MongoDB ready at: mongodb://admin:password@localhost:27017/nextjs-api?authSource=admin"

# Step 4: Generate Prisma client
print_status "Setting up database client..."
pnpm prisma:generate > /dev/null 2>&1

echo ""
print_header "✅ Setup Complete!"
echo ""
print_status "Ready to start development:"
echo "  1. Run: pnpm dev"
echo "  2. Visit: http://localhost:3000"
echo "  3. API Docs: http://localhost:3000/docs"
echo ""
print_status "MongoDB Management:"
echo "  • Stop: docker stop mongodb-dev"
echo "  • Restart: docker start mongodb-dev"
echo "  • Remove: docker rm mongodb-dev"
echo ""

# Auto-start dev server option
echo -n "Start development server now? (y/n) [y]: "
read -r START_DEV

if [ -z "$START_DEV" ] || [ "$START_DEV" = "y" ] || [ "$START_DEV" = "Y" ]; then
    print_status "Starting development server..."
    echo ""
    echo "🌟 Your API will be available at http://localhost:3000"
    echo "📚 Documentation at http://localhost:3000/docs"
    echo ""
    echo "Press Ctrl+C to stop the server"
    echo ""
    pnpm dev
else
    print_status "Run 'pnpm dev' when ready to start development!"
fi