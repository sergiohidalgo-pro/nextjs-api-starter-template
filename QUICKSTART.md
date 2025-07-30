# ⚡ Quick Start - Next.js API Starter

Get up and running in 2 minutes!

## 🎯 One Command Setup

```bash
# Clone and setup everything automatically
git clone <your-repo-url>
cd nextjs-api-starter-template
./scripts/init-project.sh
```

**That's it!** The script will:
- ✅ Install dependencies
- ✅ Generate secure credentials  
- ✅ Set up your development environment
- ✅ Start the application

## 🐳 Docker Quick Start

```bash
# Everything in Docker (zero local setup)
docker-compose up -d

# Access at http://localhost:3000
```

For local development with Docker MongoDB:
```bash
# MongoDB in Docker, API locally
docker-compose -f docker-compose.dev.yml up -d
pnpm dev
```

## 🛠️ Development Commands

```bash
# Setup project
./scripts/init-project.sh

# Development tools
./scripts/dev-tools.sh help        # Show all commands
./scripts/dev-tools.sh dev         # Start dev server
./scripts/dev-tools.sh docker up   # Start Docker
./scripts/dev-tools.sh auth test   # Test authentication

# Direct npm commands
pnpm setup                # Same as init-project.sh
pnpm dev-tools help       # Same as dev-tools.sh help
```

## 📱 After Setup

1. **Save your credentials** (displayed after setup)
2. **Setup 2FA**: Add the secret to Google Authenticator
3. **Test the API**: Visit http://localhost:3000
4. **Check docs**: Visit http://localhost:3000/docs

## 🧪 Quick Test

```bash
# Health check
curl http://localhost:3000/api/health

# Test login (use your generated credentials)
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "your-generated-password",
    "totpCode": "123456"
  }'
```

## 🆘 Troubleshooting

**Something not working?**
```bash
./scripts/dev-tools.sh clean     # Reset everything
./scripts/init-project.sh        # Setup again
```

**Need help?**
- Check [DEVELOPER-SETUP.md](./DEVELOPER-SETUP.md) for detailed instructions
- Run `./scripts/dev-tools.sh help` for all available commands