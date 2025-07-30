# 🚀 Developer Setup Guide

This guide will help you get the Next.js API Starter Template up and running in less than 5 minutes.

## Prerequisites

- **Node.js 18+** - [Download here](https://nodejs.org/)
- **pnpm** - Install with `npm install -g pnpm`
- **Docker** (optional) - [Download here](https://docker.com/get-started)

## Quick Start Options

### Option 1: Automated Setup (Recommended)

Run our automated setup script that handles everything:

```bash
# Clone the repository
git clone <your-repo-url>
cd nextjs-api-starter-template

# Run the automated setup
./scripts/init-project.sh
```

The script will:
- ✅ Install all dependencies
- ✅ Generate secure environment variables automatically
- ✅ Set up your preferred development environment
- ✅ Create admin credentials
- ✅ Configure 2FA secret
- ✅ Start services if using Docker

### Option 2: Manual Setup

If you prefer manual control:

```bash
# 1. Install dependencies
pnpm install

# 2. Copy environment template
cp .env.example .env.local

# 3. Generate secrets
pnpm run generate:jwt-secret
pnpm run generate:2fa-secret

# 4. Choose your database setup (see options below)
```

## Database Setup Options

### A) Docker Compose (All-in-One)
Perfect for quick testing and demos:

```bash
# Starts both API and MongoDB
docker-compose up -d

# Access your app at http://localhost:3000
```

### B) Docker MongoDB + Local API (Hybrid)
Best for development - database in Docker, API runs locally:

```bash
# Start only MongoDB in Docker
docker run -d --name mongodb-dev \
  -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=password \
  mongo:7-jammy

# Update your .env.local
echo "MONGODB_URI=mongodb://localhost:27017/nextjs-api" >> .env.local

# Start the API locally
pnpm dev
```

### C) Local MongoDB
For those who prefer everything local:

```bash
# Install MongoDB locally (macOS with Homebrew)
brew install mongodb-community

# Start MongoDB
brew services start mongodb-community

# Update your .env.local
echo "MONGODB_URI=mongodb://localhost:27017/nextjs-api" >> .env.local

# Start the API
pnpm dev
```

## Environment Variables Explained

Your `.env.local` file should contain:

```env
# JWT Configuration (auto-generated)
JWT_SECRET=<64-character-hex-string>
JWT_EXPIRES_IN=1h

# Admin Credentials
AUTH_USERNAME=admin
AUTH_PASSWORD=<generated-secure-password>

# 2FA Secret (auto-generated)
AUTH_2FA_SECRET=<base32-secret>

# Database Connection
MONGODB_URI=mongodb://localhost:27017/nextjs-api

# Rate Limiting
RATE_LIMIT_MAX_REQUESTS=5

# API Configuration
API_BASE_URL=http://localhost:3000
NODE_ENV=development
```

## 2FA Setup

After running the setup script, you'll get a 2FA secret. Add it to your authenticator app:

1. **Google Authenticator/Authy**: Scan QR code or enter the secret manually
2. **Account Name**: "Next.js API Starter"
3. **Secret**: Use the generated `AUTH_2FA_SECRET` value

## Testing Your Setup

### 1. Health Check
```bash
curl http://localhost:3000/api/health
```

### 2. Login Test
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "your-generated-password",
    "totpCode": "123456"
  }'
```

### 3. Web Interface
Visit `http://localhost:3000` for the interactive web interface.

### 4. API Documentation
Visit `http://localhost:3000/docs` for Swagger documentation.

## Development Commands

```bash
# Development
pnpm dev              # Start development server
pnpm build            # Build for production
pnpm start            # Start production server
pnpm lint             # Run linting

# Docker Management
pnpm docker:up        # Start Docker services
pnpm docker:down      # Stop Docker services
pnpm docker:logs      # View API logs

# Utilities
pnpm generate:jwt-secret    # Generate new JWT secret
pnpm generate:2fa-secret    # Generate new 2FA secret
pnpm change-password        # Change admin password
```

## Project Structure

```
├── src/
│   ├── app/
│   │   ├── api/              # API routes
│   │   │   ├── auth/         # Authentication endpoints
│   │   │   ├── health/       # Health check
│   │   │   └── docs/         # API documentation
│   │   ├── docs/             # Swagger UI page
│   │   └── page.tsx          # Main frontend
│   ├── lib/
│   │   ├── auth/             # Auth utilities (JWT, TOTP, passwords)
│   │   ├── config/           # Configuration & validation
│   │   ├── db/               # Database connections
│   │   └── utils/            # Utility functions
│   └── services/             # Business logic
├── scripts/                  # Setup & utility scripts
├── docker-compose.yml        # Docker configuration
└── .env.local               # Your environment variables
```

## Common Issues & Solutions

### Issue: "MongoDB connection failed"
**Solution**: 
- Check if MongoDB is running: `docker ps` or `brew services list`
- Verify `MONGODB_URI` in `.env.local`
- For Docker: `docker-compose up -d mongo`

### Issue: "2FA code invalid"
**Solution**:
- Ensure your system time is synchronized
- Check the 2FA secret in your authenticator app
- Try generating a new secret: `pnpm generate:2fa-secret`

### Issue: "Port 3000 already in use"
**Solution**:
```bash
# Use different port
pnpm dev -p 3001

# Or kill the process using port 3000
lsof -ti:3000 | xargs kill -9
```

### Issue: "JWT token invalid"
**Solution**:
- Check if `JWT_SECRET` is set in `.env.local`
- Generate new secret: `pnpm generate:jwt-secret`
- Restart the development server

## Security Checklist for Production

- [ ] Change default admin credentials
- [ ] Use strong, unique JWT secret
- [ ] Enable HTTPS
- [ ] Use environment-specific configurations
- [ ] Set up proper MongoDB authentication
- [ ] Configure rate limiting appropriately
- [ ] Enable proper logging and monitoring

## Getting Help

1. **Check the logs**: 
   - Local: Check terminal output
   - Docker: `docker-compose logs -f api`

2. **Test individual components**:
   - Database: `pnpm test:db`
   - Authentication: `pnpm test:auth`

3. **Reset everything**:
   ```bash
   # Stop all services
   docker-compose down
   
   # Remove environment file
   rm .env.local
   
   # Run setup again
   ./scripts/init-project.sh
   ```

---

**Need help?** Open an issue in the repository or check the [troubleshooting guide](TROUBLESHOOTING.md).