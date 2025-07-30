# Docker Deployment Guide

## Quick Start (Senior Developer)

```bash
# Start everything
docker-compose up -d

# Check logs
docker-compose logs -f api

# Access
# - API: http://localhost:3000
# - Docs: http://localhost:3000/docs  
# - DB Health: http://localhost:3000/api/health/db
```

## Architecture

**Multi-stage Dockerfile:**
- `node:20-alpine` base (minimal size)
- Dependency caching layer
- Build optimization
- Non-root user security
- ~18 lines total

**Services:**
- **API**: Next.js app with JWT auth + 2FA
- **MongoDB**: v7 with persistent storage
- **Auto-init**: Database tables created on startup

## Configuration

**Environment Variables:**
```env
# Database (auto-switches dev/prod)
MONGODB_URI=mongodb://mongo:27017/nextjs-api    # Docker
MONGODB_URI=mongodb+srv://user:pass@cluster...  # Production

# Auth (required)
JWT_SECRET=your-secret-key
AUTH_USERNAME=admin
AUTH_PASSWORD=your-password
AUTH_2FA_SECRET=your-totp-secret
```

**Development:**
```bash
# Start with local MongoDB
docker-compose up -d

# Rebuild after changes
docker-compose build api
```

**Production:**
```bash
# External MongoDB
MONGODB_URI=mongodb+srv://... docker-compose up -d

# Or override in docker-compose.prod.yml
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## Database Features

**Auto-initialization:**
- Creates database if not exists
- Health check tables (`system_health`, `connection_tests`)
- Connection verification on startup
- Error logging to database

**Endpoints:**
- `/api/health` - API + DB status
- `/api/health/db` - Detailed DB diagnostics

**Prisma Integration:**
- MongoDB native driver
- Auto-generated client
- Migration-ready schema
- Type-safe queries

## Monitoring

```bash
# Service status
docker-compose ps

# Resource usage
docker stats

# Database logs
docker-compose logs mongo

# API performance
curl http://localhost:3000/api/health/db
```

## Production Checklist

- [ ] Change default credentials
- [ ] Use external MongoDB URI
- [ ] Enable HTTPS proxy
- [ ] Set up monitoring
- [ ] Configure backups
- [ ] Review security headers