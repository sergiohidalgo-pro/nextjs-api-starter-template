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

1. **Clone the repository**
   ```bash
   git clone https://github.com/sergiohidalgo/nextjs-api-starter-template.git
   cd nextjs-api-starter-template
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Setup environment**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Generate secrets** (optional)
   ```bash
   # Generate JWT secret
   pnpm run generate:jwt-secret
   
   # Generate 2FA secret
   pnpm run generate:2fa-secret
   ```

5. **Start development server**
   ```bash
   pnpm dev
   ```

6. **Access the application**
   - Main interface: http://localhost:3000
   - API documentation: http://localhost:3000/docs
   - Health check: http://localhost:3000/api/health

## 📚 Documentation

- **[Setup Guide](./docs/SETUP.md)** - Detailed setup instructions
- **[API Documentation](./docs)** - Complete API reference
- **[Security Guide](./docs/SECURITY.md)** - Security implementation details
- **[Architecture Guide](./CLAUDE.md)** - Project structure and patterns

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
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage

# Lint code
pnpm lint
```

## 🚀 Deployment

### Environment Variables

Set these in your production environment:

```env
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=1h
AUTH_USERNAME=admin
AUTH_PASSWORD=secure-password-123
AUTH_2FA_SECRET=JBSWY3DPEHPK3PXP
NODE_ENV=production
RATE_LIMIT_MAX_REQUESTS=5
```

### Production Build

```bash
pnpm build
pnpm start
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