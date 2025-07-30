# Contributing to Next.js API Starter Template

First off, thank you for considering contributing to this project! It's people like you that make this template a great starting point for developers worldwide.

## 🤝 How to Contribute

### Reporting Bugs

Before creating bug reports, please check the issue list as you might find that you don't need to create one. When you create a bug report, please include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps to reproduce the problem**
- **Provide specific examples to demonstrate the steps**
- **Describe the behavior you observed after following the steps**
- **Explain which behavior you expected to see instead and why**
- **Include screenshots if possible**

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

- **Use a clear and descriptive title**
- **Provide a step-by-step description of the suggested enhancement**
- **Provide specific examples to demonstrate the steps**
- **Describe the current behavior and explain the behavior you expected to see instead**
- **Explain why this enhancement would be useful**

### Pull Requests

1. **Fork the repository** and create your branch from `main`
2. **Make your changes** following our coding standards
3. **Add tests** if you've added code that should be tested
4. **Ensure the test suite passes**
5. **Make sure your code lints**
6. **Write a good commit message**
7. **Issue that pull request!**

## 🛠️ Development Process

### Setting Up Your Development Environment

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/your-username/nextjs-api-starter-template.git
   cd nextjs-api-starter-template
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up your environment**
   ```bash
   # Use the automated setup
   ./scripts/quick-setup.sh
   
   # Or manually
   cp .env.example .env.local
   # Edit .env.local with your values
   ```

4. **Start development**
   ```bash
   pnpm dev
   ```

### Running Tests

Make sure all tests pass before submitting your changes:

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage

# Run linting
pnpm lint
```

### Coding Standards

- **TypeScript**: We use TypeScript for type safety
- **ESLint**: Follow the existing ESLint configuration
- **Prettier**: Code is automatically formatted (run `pnpm format`)
- **Naming Conventions**: 
  - Use camelCase for variables and functions
  - Use PascalCase for components and classes
  - Use kebab-case for file names
- **Comments**: Write clear, concise comments for complex logic
- **Testing**: Write unit tests for new functions and integration tests for API endpoints

### Project Structure Guidelines

When adding new features, follow the existing architecture:

```
src/
├── app/api/           # API routes (thin controllers)
├── lib/               # Core utilities and configurations
├── services/          # Business logic
├── components/        # React components
└── __tests__/         # Test files
```

**Key Principles:**
- Keep API routes thin - business logic goes in services
- Use Zod schemas for input validation
- Follow the established error handling patterns
- Maintain consistent response formats
- Add proper JSDoc comments for public APIs

## 🔐 Security Guidelines

- **Never commit secrets** or sensitive information
- **Use environment variables** for configuration
- **Validate all inputs** using Zod schemas
- **Follow security best practices** for authentication and authorization
- **Report security vulnerabilities** privately via email

## 📝 Commit Message Guidelines

We follow conventional commits for clear version history:

```
type(scope): description

[optional body]

[optional footer]
```

**Types:**
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `test`: Adding missing tests or correcting existing tests
- `chore`: Changes to the build process or auxiliary tools

**Examples:**
```
feat(auth): add password reset functionality
fix(api): resolve token validation edge case
docs(readme): update setup instructions
test(auth): add integration tests for login flow
```

## 🎯 Priority Areas for Contributions

We especially welcome contributions in these areas:

1. **Documentation improvements** - Help make setup and usage clearer
2. **Test coverage** - Add unit and integration tests
3. **Security enhancements** - Improve authentication and authorization
4. **Performance optimizations** - Make the API faster and more efficient
5. **Additional API endpoints** - Expand the starter template functionality
6. **Docker improvements** - Better containerization and deployment
7. **CI/CD pipelines** - GitHub Actions and automation

## 🐛 Bug Triage

If you want to help with bug triage, please:

1. **Reproduce the issue** following the steps in the bug report
2. **Label the issue** appropriately (bug, enhancement, question, etc.)
3. **Provide additional context** if you can reproduce or have more information
4. **Link related issues** if you find duplicates

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Jest Testing Framework](https://jestjs.io/docs/getting-started)
- [Swagger/OpenAPI Specification](https://swagger.io/specification/)

## 💬 Questions & Support

Don't hesitate to ask questions! You can:

- **Open an issue** with the `question` label
- **Start a discussion** in the repository discussions
- **Check existing issues** - your question might already be answered
- **Contact the creator directly**: [mail@sergiohidalgo.pro](mailto:mail@sergiohidalgo.pro)

### 📞 Direct Contact

For urgent questions, collaboration opportunities, or technical consulting:

**Sergio Hidalgo** - Project Creator & Maintainer
- 📧 **Email**: [mail@sergiohidalgo.pro](mailto:mail@sergiohidalgo.pro)
- 🌐 **Website**: [sergiohidalgo.pro](https://sergiohidalgo.pro)
- 💼 **GitHub**: [@sergiohidalgo-pro](https://github.com/sergiohidalgo-pro)

## 🙏 Recognition

Contributors will be recognized in:

- The project's README.md
- Release notes for significant contributions
- GitHub's contributors page

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for your interest in contributing to the Next.js API Starter Template!**