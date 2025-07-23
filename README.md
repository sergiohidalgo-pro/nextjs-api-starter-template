# Next.js 2FA Authentication Demo

This project is a high-quality demonstration of a secure authentication system built with Next.js. It's designed to be a learning resource and a robust starting point for applications requiring user authentication. The entire system is self-contained and does not require a database, storing credentials and configuration in environment variables.

## Key Features

-   **Username/Password Authentication**: Securely validates user credentials against hashed passwords.
-   **Two-Factor Authentication (2FA/TOTP)**: Adds a second layer of security using time-based one-time passwords from authenticator apps.
-   **JSON Web Tokens (JWT)**: Implements a stateless authentication flow using short-lived access tokens and long-lived refresh tokens.
-   **In-Memory Rate Limiting**: Protects against brute-force attacks with a simple, server-restart-persistent rate limiter.
-   **Secure by Design**: Follows security best practices, including hashing passwords with `bcrypt` and providing scripts to generate secure secrets.
-   **SOLID & Functional Principles**: The codebase is structured following SOLID principles for maintainability and uses functional programming concepts for clarity and testability.
-   **Comprehensive Testing**: Includes unit tests for critical business logic to ensure reliability.

## Getting Started

For detailed instructions on how to set up, configure, and run this project locally, please see the **[Setup Guide](./docs/SETUP.md)**.

## Project Structure

The project is organized with a clear separation of concerns:

-   `src/app/api/`: API routes, acting as thin controllers.
-   `src/services/`: Contains all business logic (e.g., `AuthService`).
-   `src/lib/`: Core libraries, utilities, and helper functions (e.g., for JWT, password hashing, etc.).
-   `src/__tests__/`: Unit and integration tests.
-   `docs/`: Project documentation.
-   `scripts/`: Helper scripts for generating secrets and passwords.

## Philosophy

The goal of this project is to provide a clear, well-documented, and secure example of a modern authentication flow. It's built to be easily understood, maintained, and extended, making it an ideal reference for both developers and AI assistants.

---

# 🛠️ Contributing & Roadmap

> Open source contributions are welcome! Here's what needs to be done to make this project even better.

## 🐛 Known Issues

- [ ] **Tests failing**: `AuthService.authenticate` method doesn't exist, should be `authenticateUser` 
- [ ] **Memory leak**: Rate limiter Map grows indefinitely without cleanup
- [ ] **Temp files**: Remove `direct-auth-test.js`, `test-*.js` from repository
- [ ] **Dependency vulnerability**: PrismJS < 1.30.0 (moderate severity)

## 🔧 Technical Improvements

### **Authentication & Security**
- [ ] Replace in-memory rate limiter with Redis implementation
- [ ] Add password strength validation
- [ ] Implement audit logging for security events
- [ ] Fix password change persistence (currently lost on restart)
- [ ] Remove sensitive data from console logs

### **Architecture & Code Quality**
- [ ] Refactor `AuthService._verifyUserCredentials` (too complex, 87 lines)
- [ ] Create reusable authentication middleware
- [ ] Implement proper error handling patterns
- [ ] Add request/response logging middleware
- [ ] Normalize comment language (mixed EN/ES)

### **Performance & Scalability**
- [ ] Add JWT validation caching
- [ ] Implement token cleanup mechanism
- [ ] Configure Next.js optimizations (compression, output)
- [ ] Add database support for user management
- [ ] Optimize bundle size

## 🚀 New Features

### **Core Features**
- [ ] User roles and permissions (RBAC)
- [ ] Password recovery flow
- [ ] Account lockout after failed attempts
- [ ] Session management dashboard
- [ ] Email notifications for security events

### **Developer Experience**
- [ ] Docker configuration
- [ ] GitHub Actions CI/CD
- [ ] Automated testing pipeline
- [ ] Development environment improvements
- [ ] API versioning

### **Documentation**
- [ ] Architecture decision records (ADRs)
- [ ] API integration examples
- [ ] Deployment guides
- [ ] Troubleshooting documentation
- [ ] Contributing guidelines

## 🏷️ Good First Issues

Perfect for newcomers to the project:

- [ ] Fix broken test suite
- [ ] Add missing TypeScript types
- [ ] Improve error messages
- [ ] Add input validation examples
- [ ] Update documentation typos
- [ ] Add environment variable validation

## 🎯 Current Focus Areas

**v1.1.0** (Next Release)
- Fix test suite
- Implement Redis rate limiter
- Add Docker support
- Security logging improvements

**v2.0.0** (Future)
- Database integration
- User management API
- Role-based access control
- Admin dashboard

## 💡 Enhancement Ideas

- [ ] GraphQL API alternative
- [ ] WebSocket support for real-time features
- [ ] Multi-tenant architecture
- [ ] OAuth2 provider integration
- [ ] Audit trail export functionality
- [ ] Metrics and monitoring dashboard

## 📋 How to Contribute

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

See our [Setup Guide](./docs/SETUP.md) for development environment configuration.

---

**Project Status**: Active development • Contributions welcome • Issues labeled for difficulty