#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}[SETUP]${NC} $1"
}

# Check if running from project root
if [ ! -f "package.json" ]; then
    print_error "This script must be run from the project root directory"
    exit 1
fi

print_header "🚀 Initializing Next.js API Starter Template"
echo ""

# Step 1: Check Node.js and pnpm
print_status "Checking prerequisites..."
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

if ! command -v pnpm &> /dev/null; then
    print_error "pnpm is not installed. Installing pnpm globally..."
    npm install -g pnpm
fi

NODE_VERSION=$(node --version)
print_status "Node.js version: $NODE_VERSION"

# Step 2: Install dependencies
print_status "Installing dependencies with pnpm..."
pnpm install

# Step 3: Generate environment file
print_header "🔧 Setting up environment variables"

if [ -f ".env" ]; then
    print_warning ".env already exists. Creating backup..."
    cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
fi

# Copy from example
cp .env.example .env

# Generate JWT secret
print_status "Generating JWT secret..."
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")

# Generate 2FA secret
print_status "Generating 2FA secret..."
TOTP_SECRET=$(node -e "
const speakeasy = require('speakeasy');
const secret = speakeasy.generateSecret({
    name: 'Next.js API Starter',
    issuer: 'Starter Template'
});
console.log(secret.base32);
")

# Replace placeholders in .env
print_status "Updating environment variables..."

# Use different delimiters to avoid conflicts with special characters
sed -i.bak "s|JWT_SECRET=.*|JWT_SECRET=$JWT_SECRET|g" .env
sed -i.bak "s|AUTH_2FA_SECRET=.*|AUTH_2FA_SECRET=$TOTP_SECRET|g" .env

# Generate random password
RANDOM_PASSWORD=$(node -e "console.log(require('crypto').randomBytes(16).toString('hex'))")
sed -i.bak "s|AUTH_PASSWORD=.*|AUTH_PASSWORD=$RANDOM_PASSWORD|g" .env

# Clean up backup file
rm .env.bak

print_status "Environment file created successfully!"

# Step 4: Setup development mode selection
echo ""
print_header "🐳 Choose your development setup:"
echo "1) Hybrid setup (Docker MongoDB + Local API) - RECOMMENDED"
echo "2) Full Docker Compose (API + MongoDB)"
echo "3) Local development (requires local MongoDB)"
echo -n "Enter your choice (1-3) [1]: "
read -r SETUP_CHOICE

# Default to option 1 if no input
if [ -z "$SETUP_CHOICE" ]; then
    SETUP_CHOICE=1
fi

case $SETUP_CHOICE in
    1)
        print_status "Setting up hybrid mode (Docker MongoDB + Local API)..."
        print_status "Starting MongoDB container..."
        
        # Stop and remove existing container if it exists
        docker stop mongodb-dev 2>/dev/null || true
        docker rm mongodb-dev 2>/dev/null || true
        
        # Start new MongoDB container
        docker run -d --name mongodb-dev \
            -p 27017:27017 \
            -e MONGO_INITDB_ROOT_USERNAME=admin \
            -e MONGO_INITDB_ROOT_PASSWORD=password \
            -e MONGO_INITDB_DATABASE=nextjs-api \
            -v mongodb_data:/data/db \
            mongo:7-jammy
        
        print_status "MongoDB container started!"
        print_status "Connection string: mongodb://admin:password@localhost:27017/nextjs-api?authSource=admin"
        
        # Ensure .env has the correct connection string with authentication
        sed -i.bak "s|MONGODB_URI=.*|MONGODB_URI=mongodb://admin:password@localhost:27017/nextjs-api?authSource=admin|g" .env
        rm .env.bak
        ;;
    2) 
        print_status "Setting up for Docker Compose..."
        # Update connection string for Docker Compose with authentication
        sed -i.bak "s|MONGODB_URI=.*|MONGODB_URI=mongodb://admin:password@mongo:27017/nextjs-api?authSource=admin|g" .env
        rm .env.bak
        print_status "Starting Docker Compose services..."
        docker-compose up -d
        print_status "Services started! API will be available at http://localhost:3000"
        ;;
    3)
        print_status "Setting up for local development..."
        # Keep the default localhost connection
        print_warning "Make sure MongoDB is running locally on port 27017"
        print_status "You can start MongoDB with: mongod --dbpath /path/to/db"
        print_status "Or install MongoDB: https://docs.mongodb.com/manual/installation/"
        ;;
    *)
        print_warning "Invalid choice. Defaulting to hybrid setup."
        SETUP_CHOICE=1
        # Repeat the hybrid setup logic
        print_status "Setting up hybrid mode (Docker MongoDB + Local API)..."
        docker stop mongodb-dev 2>/dev/null || true
        docker rm mongodb-dev 2>/dev/null || true
        docker run -d --name mongodb-dev \
            -p 27017:27017 \
            -e MONGO_INITDB_ROOT_USERNAME=admin \
            -e MONGO_INITDB_ROOT_PASSWORD=password \
            -e MONGO_INITDB_DATABASE=nextjs-api \
            -v mongodb_data:/data/db \
            mongo:7-jammy
        print_status "MongoDB container started!"
        print_status "Connection string: mongodb://admin:password@localhost:27017/nextjs-api?authSource=admin"
        
        # Ensure .env has the correct connection string with authentication
        sed -i.bak "s|MONGODB_URI=.*|MONGODB_URI=mongodb://admin:password@localhost:27017/nextjs-api?authSource=admin|g" .env
        rm .env.bak
        ;;
esac

# Step 5: Generate Prisma client
print_status "Generating Prisma client..."
pnpm prisma:generate

# Step 6: Display setup information
echo ""
print_header "🎉 Setup Complete!"
echo ""
print_status "Your credentials:"
echo "  Username: admin"
echo "  Password: $RANDOM_PASSWORD"
echo "  2FA Secret: $TOTP_SECRET"
echo ""
print_status "Add the 2FA secret to your authenticator app:"
echo "  1. Open Google Authenticator or similar app"
echo "  2. Scan QR code or enter secret manually: $TOTP_SECRET"
echo "  3. Account name: Next.js API Starter"
echo ""
print_status "Next steps:"
case $SETUP_CHOICE in
    1)
        echo "  1. MongoDB is running in Docker container 'mongodb-dev'"
        echo "  2. Run: pnpm dev"
        echo "  3. Stop MongoDB later with: docker stop mongodb-dev"
        ;;
    2)
        echo "  1. API is already running at http://localhost:3000"
        echo "  2. Check logs with: docker-compose logs -f api"
        echo "  3. Stop services with: docker-compose down"
        ;;
    3)
        echo "  1. Start MongoDB locally first"
        echo "  2. Run: pnpm dev"
        ;;
esac
echo "  3. Visit http://localhost:3000 to test the API"
echo "  4. Visit http://localhost:3000/docs for Swagger documentation"
echo ""
print_warning "⚠️  Save your credentials! They won't be displayed again."
print_status "Environment file: .env"
echo ""

# Step 7: Offer to open in browser
if command -v open &> /dev/null; then  # macOS
    echo -n "Open the application in browser? (y/n): "
    read -r OPEN_BROWSER
    if [ "$OPEN_BROWSER" = "y" ] || [ "$OPEN_BROWSER" = "Y" ]; then
        if [ "$SETUP_CHOICE" = "2" ]; then
            sleep 3  # Wait for Docker services to start
        fi
        open http://localhost:3000
    fi
elif command -v xdg-open &> /dev/null; then  # Linux
    echo -n "Open the application in browser? (y/n): "
    read -r OPEN_BROWSER
    if [ "$OPEN_BROWSER" = "y" ] || [ "$OPEN_BROWSER" = "Y" ]; then
        if [ "$SETUP_CHOICE" = "2" ]; then
            sleep 3  # Wait for Docker services to start
        fi
        xdg-open http://localhost:3000
    fi
fi

print_status "Setup completed successfully! 🎉"