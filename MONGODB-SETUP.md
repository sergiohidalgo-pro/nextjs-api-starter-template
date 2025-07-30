# MongoDB Setup Guide

## Quick Start (Recommended)

The easiest way to get started is with our **hybrid approach** - Docker MongoDB + Local API:

```bash
# 1. Quick setup (everything automated)
pnpm quick-setup

# 2. Or detailed setup with options
pnpm setup
```

This automatically:
- ✅ Creates `.env` with secure credentials
- ✅ Starts MongoDB in Docker
- ✅ Sets up the connection string: `mongodb://localhost:27017/nextjs-api`
- ✅ Ready to run `pnpm dev`

## Connection Strings

### Default (Hybrid - Docker MongoDB + Local API)
```bash
MONGODB_URI=mongodb://localhost:27017/nextjs-api
```
- MongoDB runs in Docker container
- API runs locally with `pnpm dev`
- Best for development (fast, easy)

### Full Docker (API + MongoDB)
```bash
MONGODB_URI=mongodb://mongo:27017/nextjs-api
```
- Both API and MongoDB in Docker
- Use with `docker-compose up -d`
- Best for production-like testing

### Production (Cloud MongoDB)
```bash
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
```
- MongoDB Atlas or other cloud provider
- Replace with your actual credentials

## Manual MongoDB Setup

### Option 1: Docker MongoDB Only (Hybrid)
```bash
# Start MongoDB container
docker run -d --name mongodb-dev \
  -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=password \
  -e MONGO_INITDB_DATABASE=nextjs-api \
  -v mongodb_data:/data/db \
  mongo:7-jammy

# Update .env
MONGODB_URI=mongodb://localhost:27017/nextjs-api

# Run API locally
pnpm dev
```

### Option 2: Full Docker Compose
```bash
# Update .env for docker-compose
MONGODB_URI=mongodb://mongo:27017/nextjs-api

# Start everything
docker-compose up -d

# View logs
docker-compose logs -f api
```

### Option 3: Local MongoDB Installation
```bash
# Install MongoDB locally (macOS)
brew install mongodb-community

# Start MongoDB service
brew services start mongodb-community

# Update .env
MONGODB_URI=mongodb://localhost:27017/nextjs-api

# Run API
pnpm dev
```

## Database Management

### Check Connection
```bash
# Using Node.js
node -e "
const { MongoClient } = require('mongodb');
MongoClient.connect('mongodb://localhost:27017/nextjs-api')
  .then(() => console.log('✅ Connected'))
  .catch(err => console.log('❌ Failed:', err.message));
"
```

### MongoDB Compass (GUI)
Connect using: `mongodb://localhost:27017/nextjs-api`

### Container Management
```bash
# Status
docker ps | grep mongodb-dev

# Stop
docker stop mongodb-dev

# Start
docker start mongodb-dev

# Remove (data will be lost)
docker rm mongodb-dev

# View logs
docker logs mongodb-dev
```

## Troubleshooting

### Port Already in Use
```bash
# Check what's using port 27017
lsof -i :27017

# Stop existing MongoDB
docker stop mongodb-dev
# or
brew services stop mongodb-community
```

### Connection Refused
1. Ensure MongoDB is running
2. Check the connection string in `.env`
3. Verify port 27017 is accessible

### Data Persistence
Data is stored in Docker volume `mongodb_data`. To reset:
```bash
docker stop mongodb-dev
docker rm mongodb-dev
docker volume rm mongodb_data
```

## Connection String Reference

| Setup Type | Connection String | Usage |
|------------|------------------|-------|
| **Hybrid (Recommended)** | `mongodb://localhost:27017/nextjs-api` | Docker MongoDB + Local API |
| **Full Docker** | `mongodb://mongo:27017/nextjs-api` | Docker Compose |
| **Local MongoDB** | `mongodb://localhost:27017/nextjs-api` | Installed MongoDB |
| **Production** | `mongodb+srv://...` | Cloud providers |

The hybrid approach is recommended because:
- ✅ Fast development cycles (no container rebuilds)
- ✅ Easy debugging and hot reload
- ✅ Persistent data in Docker volume
- ✅ No local MongoDB installation required