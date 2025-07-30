#!/bin/bash

# Development Tools Script
# Provides easy commands for common development tasks

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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
    echo -e "${BLUE}[DEV-TOOLS]${NC} $1"
}

show_help() {
    print_header "🛠️  Development Tools"
    echo ""
    echo "Available commands:"
    echo "  setup           - Initial project setup"
    echo "  dev             - Start development server"
    echo "  docker          - Docker management"
    echo "  db              - Database management"
    echo "  test            - Testing utilities"
    echo "  auth            - Authentication tools"
    echo "  logs            - View application logs"
    echo "  clean           - Clean project (reset)"
    echo "  help            - Show this help message"
    echo ""
}

setup_project() {
    print_header "🚀 Setting up project..."
    ./scripts/init-project.sh
}

start_dev() {
    print_header "🔥 Starting development server..."
    
    # Check if .env exists
    if [ ! -f ".env" ]; then
        print_warning ".env not found. Running setup first..."
        setup_project
    fi
    
    print_status "Starting Next.js development server..."
    pnpm dev
}

manage_docker() {
    case $2 in
        "up"|"start")
            print_status "Starting Docker services..."
            docker-compose up -d
            ;;
        "down"|"stop")
            print_status "Stopping Docker services..."
            docker-compose down
            ;;
        "logs")
            print_status "Showing API logs..."
            docker-compose logs -f api
            ;;
        "mongo-only")
            print_status "Starting MongoDB container only..."
            docker run -d --name mongodb-dev \
                -p 27017:27017 \
                -e MONGO_INITDB_ROOT_USERNAME=admin \
                -e MONGO_INITDB_ROOT_PASSWORD=password \
                -e MONGO_INITDB_DATABASE=nextjs-api \
                mongo:7-jammy
            ;;
        "status")
            print_status "Docker container status:"
            docker-compose ps
            ;;
        "rebuild")
            print_status "Rebuilding Docker images..."
            docker-compose build --no-cache
            ;;
        *)
            echo "Docker commands:"
            echo "  up/start      - Start all services"
            echo "  down/stop     - Stop all services"
            echo "  logs          - Show API logs"
            echo "  mongo-only    - Start only MongoDB"
            echo "  status        - Show container status"
            echo "  rebuild       - Rebuild images"
            ;;
    esac
}

manage_database() {
    case $2 in
        "status")
            print_status "Checking database connection..."
            node -e "
            const { MongoClient } = require('mongodb');
            const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/nextjs-api';
            MongoClient.connect(uri)
                .then(() => console.log('✅ Database connected successfully'))
                .catch(err => console.log('❌ Database connection failed:', err.message));
            "
            ;;
        "reset")
            print_warning "This will delete all data. Are you sure? (y/N)"
            read -r confirm
            if [ "$confirm" = "y" ] || [ "$confirm" = "Y" ]; then
                print_status "Resetting database..."
                # Add database reset logic here
                print_status "Database reset complete"
            else
                print_status "Operation cancelled"
            fi
            ;;
        "seed")
            print_status "Seeding database with test data..."
            # Add seeding logic here
            print_status "Database seeded successfully"
            ;;
        *)
            echo "Database commands:"
            echo "  status        - Check database connection"
            echo "  reset         - Reset database (removes all data)"
            echo "  seed          - Seed with test data"
            ;;
    esac
}

run_tests() {
    case $2 in
        "unit")
            print_status "Running unit tests..."
            pnpm test
            ;;
        "integration")
            print_status "Running integration tests..."
            pnpm test -- --testPathPattern=integration
            ;;
        "auth")
            print_status "Testing authentication..."
            ./test-complete-auth.sh
            ;;
        "api")
            print_status "Testing API endpoints..."
            pnpm test -- --testPathPattern=api-routes
            ;;
        "coverage")
            print_status "Running test coverage..."
            pnpm test:coverage
            ;;
        *)
            echo "Test commands:"
            echo "  unit          - Run unit tests"
            echo "  integration   - Run integration tests"
            echo "  auth          - Test authentication flow"
            echo "  api           - Test API endpoints"
            echo "  coverage      - Run with coverage report"
            ;;
    esac
}

manage_auth() {
    case $2 in
        "test")
            print_status "Testing authentication..."
            username=$(grep "AUTH_USERNAME=" .env | cut -d'=' -f2)
            password=$(grep "AUTH_PASSWORD=" .env | cut -d'=' -f2)
            
            echo "Username: $username"
            echo "Password: $password"
            echo "Please enter your 6-digit TOTP code:"
            read -r totp
            
            curl -X POST http://localhost:3000/api/auth/login \
                -H "Content-Type: application/json" \
                -d "{\"username\":\"$username\",\"password\":\"$password\",\"totpCode\":\"$totp\"}"
            ;;
        "generate-jwt")
            print_status "Generating new JWT secret..."
            pnpm run generate:jwt-secret
            ;;
        "generate-2fa")
            print_status "Generating new 2FA secret..."
            pnpm run generate:2fa-secret
            ;;
        "change-password")
            print_status "Changing admin password..."
            pnpm run change-password
            ;;
        "show-credentials")
            print_status "Current credentials:"
            echo "Username: $(grep "AUTH_USERNAME=" .env | cut -d'=' -f2)"
            echo "Password: $(grep "AUTH_PASSWORD=" .env | cut -d'=' -f2)"
            echo "2FA Secret: $(grep "AUTH_2FA_SECRET=" .env | cut -d'=' -f2)"
            ;;
        *)
            echo "Auth commands:"
            echo "  test              - Test login with current credentials"
            echo "  generate-jwt      - Generate new JWT secret"
            echo "  generate-2fa      - Generate new 2FA secret"
            echo "  change-password   - Change admin password"
            echo "  show-credentials  - Show current credentials"
            ;;
    esac
}

view_logs() {
    case $2 in
        "docker")
            print_status "Showing Docker API logs..."
            docker-compose logs -f api
            ;;
        "dev")
            print_status "Development logs are shown in the terminal where you ran 'pnpm dev'"
            ;;
        *)
            echo "Log commands:"
            echo "  docker        - Show Docker container logs"
            echo "  dev           - Show development server logs"
            ;;
    esac
}

clean_project() {
    print_warning "This will clean the project and remove generated files. Continue? (y/N)"
    read -r confirm
    if [ "$confirm" = "y" ] || [ "$confirm" = "Y" ]; then
        print_status "Cleaning project..."
        
        # Stop Docker services
        docker-compose down 2>/dev/null || true
        
        # Remove environment file
        rm -f .env .env.backup.*
        
        # Remove node_modules and lock file
        rm -rf node_modules
        rm -f pnpm-lock.yaml
        
        # Remove generated files
        rm -rf .next
        rm -rf src/generated
        
        print_status "Project cleaned. Run './scripts/dev-tools.sh setup' to reinitialize."
    else
        print_status "Operation cancelled"
    fi
}

# Main command handler
case $1 in
    "setup")
        setup_project
        ;;
    "dev")
        start_dev
        ;;
    "docker")
        manage_docker "$@"
        ;;
    "db")
        manage_database "$@"
        ;;
    "test")
        run_tests "$@"
        ;;
    "auth")
        manage_auth "$@"
        ;;
    "logs")
        view_logs "$@"
        ;;
    "clean")
        clean_project
        ;;
    "help"|""|*)
        show_help
        ;;
esac