# Next.js API Starter Template

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)
[![Next.js](https://img.shields.io/badge/Next.js-15.4.3-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue?logo=typescript)](https://www.typescriptlang.org/)

A production-ready Next.js API starter template with JWT authentication, 2FA support, rate limiting, and comprehensive documentation. Perfect for kickstarting secure API projects.

## ✨ Features

- 🔐 **JWT Authentication** - Secure token-based authentication with refresh tokens
- 🛡️ **Two-Factor Authentication (2FA)** - TOTP support with authenticator apps
- 🚀 **Rate Limiting** - Built-in protection against brute-force attacks
- 📚 **Swagger Documentation** - Interactive API documentation
- 🧪 **Testing Suite** - Comprehensive unit and integration tests
- 🔒 **Security First** - Following security best practices
- 🏗️ **Clean Architecture** - SOLID principles and separation of concerns
- 📝 **TypeScript** - Full type safety throughout the project

## 🚀 Quick Start

### Option 1: Automated Setup (Recommended)

```bash
# Clone the repository
git clone <your-repo-url>
cd nextjs-api-starter-template

# Run the automated setup script
./scripts/init-project.sh
```

The script will automatically:
- ✅ Install all dependencies
- ✅ Generate secure environment variables
- ✅ Set up your preferred development environment (local/Docker)
- ✅ Create admin credentials with 2FA
- ✅ Start the development server

### Option 2: Manual Setup

```bash
# 1. Install dependencies
pnpm install

# 2. Setup environment with automation
./scripts/dev-tools.sh setup

# 3. Start development
./scripts/dev-tools.sh dev

# OR manually
cp .env.example .env.local  # Edit as needed
pnpm dev
```

### Option 3: Docker (All-in-One)

```bash
# Start everything with Docker
docker-compose up -d

# Access at http://localhost:3000
```

### 🎯 Quick Access

After setup, access your application:
- **Main interface**: http://localhost:3000
- **API documentation**: http://localhost:3000/docs  
- **Health check**: http://localhost:3000/api/health

### 📱 2FA Setup

Add the generated 2FA secret to Google Authenticator:
1. Open your authenticator app
2. Scan QR code or enter the secret manually
3. Account: "Next.js API Starter"

## 📚 Documentation

- **[Developer Setup Guide](./DEVELOPER-SETUP.md)** - Complete setup instructions for developers
- **[Development Tools](./scripts/dev-tools.sh)** - Utility scripts for common tasks
- **[API Documentation](./docs)** - Complete API reference  
- **[Security Guide](./docs/SECURITY.md)** - Security implementation details
- **[Architecture Guide](./CLAUDE.md)** - Project structure and patterns
- **[MongoDB Setup](./SETUP-MONGO.md)** - Database setup instructions

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login` - User login with 2FA
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/change-password` - Change user password

### Utility
- `GET /api/health` - Health check endpoint
- `GET /api/validate-token` - Validate JWT token
- `GET /api/demo/math` - Demo endpoint with rate limiting

### Documentation
- `GET /api/docs` - OpenAPI specification
- `GET /docs` - Interactive Swagger UI

## 🛠️ Technology Stack

- **Framework**: Next.js 15.4.3 with App Router
- **Language**: TypeScript
- **Authentication**: JWT + TOTP (Google Authenticator)
- **Validation**: Zod schemas
- **Documentation**: Swagger/OpenAPI 3.0
- **Styling**: Tailwind CSS
- **Testing**: Jest
- **Package Manager**: pnpm

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes (controllers)
│   ├── docs/              # Swagger UI page
│   └── page.tsx           # Frontend demo
├── lib/                   # Core libraries
│   ├── auth/              # Authentication utilities
│   ├── config/            # Configuration
│   ├── types/             # TypeScript types
│   ├── validators/        # Zod schemas
│   └── utils/             # Utility functions
├── services/              # Business logic
└── __tests__/             # Test suites
```

## 🔒 Security Features

- **JWT Tokens**: Stateless authentication with short-lived access tokens
- **2FA/TOTP**: Time-based one-time passwords for enhanced security
- **Rate Limiting**: Protection against brute-force attacks
- **Input Validation**: Zod schemas for request validation
- **Password Hashing**: bcrypt for secure password storage
- **Environment Validation**: Runtime environment variable validation

## 🧪 Testing

```bash
# Using development tools (recommended)
./scripts/dev-tools.sh test unit          # Unit tests
./scripts/dev-tools.sh test integration   # Integration tests
./scripts/dev-tools.sh test auth          # Authentication tests
./scripts/dev-tools.sh test coverage      # With coverage

# Or directly with pnpm
pnpm test                    # Run all tests
pnpm test:watch             # Watch mode
pnpm test:coverage          # With coverage
pnpm lint                   # Lint code
```

## 🛠️ Development Tools

We've created a comprehensive development tools script to make your workflow easier:

```bash
# Show all available commands
./scripts/dev-tools.sh help

# Common commands
./scripts/dev-tools.sh setup           # Initial project setup
./scripts/dev-tools.sh dev             # Start development server
./scripts/dev-tools.sh docker up       # Start Docker services
./scripts/dev-tools.sh auth test       # Test authentication
./scripts/dev-tools.sh db status       # Check database connection
./scripts/dev-tools.sh clean           # Clean/reset project
```

## 🚀 Deployment

### Quick Deploy with Docker

```bash
# Production deployment
docker-compose up -d

# Or use the development tools
./scripts/dev-tools.sh docker up
```

### Manual Production Build

```bash
pnpm build
pnpm start
```

### Environment Variables

**Important**: Use the automated setup to generate secure variables:

```bash
./scripts/init-project.sh  # Generates secure JWT secrets and passwords
```

## 🤝 Contributing

We welcome contributions! Please see our [contributing guidelines](./CLAUDE.md#contributing) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Credits and Acknowledgments

This project was created by:
- **[Sergio Hidalgo](https://github.com/sergiohidalgo)** - Original architecture, design, and project conception
- **[Claude Code (Claude-4 Model by Anthropic)](https://claude.ai/code)** - Code implementation and development assistance

### Built With

- [Next.js](https://nextjs.org/) - The React framework for production
- [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Zod](https://zod.dev/) - TypeScript-first schema validation
- [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken) - JWT implementation
- [speakeasy](https://github.com/speakeasyjs/speakeasy) - 2FA/TOTP implementation
- [Swagger](https://swagger.io/) - API documentation

## 🐛 Issues and Support

If you encounter any issues or have questions, please [open an issue](https://github.com/sergiohidalgo/nextjs-api-starter-template/issues) on GitHub.

## ⭐ Star History

If you find this project useful, please consider giving it a star on GitHub!

---

**Made with ❤️ by Sergio Hidalgo and Claude Code**