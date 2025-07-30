# Next.js API Starter Template

A production-ready API starter template built with Next.js, featuring JWT authentication, 2FA support, and comprehensive documentation.

## 🏗️ Created By

- **Sergio Hidalgo** - Original architecture, design, and project conception
- **Claude Code (Claude-4 Model by Anthropic)** - Code implementation and development assistance

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## Project Overview

This is a Next.js API project built with TypeScript, following SOLID principles and clean architecture patterns. It provides:

- **Health Check API** - Monitor API status
- **JWT Authentication** - Secure token-based auth with username/password + 2FA
- **Swagger Documentation** - Interactive API documentation
- **Frontend Interface** - Simple UI to test API endpoints
- **Environment Configuration** - Secure config management with validation
- **Docker Deployment** - Containerized deployment with MongoDB integration

## Architecture

The project follows SOLID principles with a clean architecture:

```
src/
├── app/
│   ├── api/                    # API routes
│   │   ├── auth/login/         # Authentication endpoint
│   │   ├── health/             # Health check endpoint
│   │   └── docs/               # Swagger JSON endpoint
│   ├── docs/                   # Swagger UI page
│   └── page.tsx                # Main frontend interface
├── lib/
│   ├── auth/                   # Authentication utilities
│   │   ├── jwt.ts              # JWT service
│   │   ├── totp.ts             # TOTP/2FA service
│   │   └── password.ts         # Password hashing service
│   ├── config/                 # Configuration
│   │   ├── env.ts              # Environment validation
│   │   └── swagger.ts          # Swagger configuration
│   ├── db/                     # Database utilities
│   │   └── mongodb.ts          # MongoDB connection
│   ├── types/                  # TypeScript types
│   ├── validators/             # Zod schemas
│   └── utils/                  # Utility functions
└── services/                   # Business logic services
    └── authService.ts          # Authentication service
```

## Technology Stack

- **Framework**: Next.js 15.4.3 with App Router
- **Language**: TypeScript
- **Database**: MongoDB with native driver
- **Authentication**: JWT + TOTP (Google Authenticator)
- **Validation**: Zod
- **Documentation**: Swagger/OpenAPI 3.0
- **Styling**: Tailwind CSS
- **Package Manager**: pnpm
- **Containerization**: Docker + Docker Compose

## Quick Start

### 🚀 Zero-Config Setup (Recommended)

Get running in 30 seconds with everything automated:

```bash
# Install dependencies and setup everything
pnpm quick-setup

# That's it! API will be at http://localhost:3000
```

This automatically:
- ✅ Installs dependencies
- ✅ Generates secure `.env` with random credentials
- ✅ Starts MongoDB in Docker
- ✅ Sets up database connection
- ✅ Optionally starts the development server

### 🛠️ Custom Setup (More Options)

If you want to choose your setup approach:

```bash
# Interactive setup with options
pnpm setup

# Choose from:
# 1. Hybrid setup (Docker MongoDB + Local API) - RECOMMENDED
# 2. Full Docker Compose (API + MongoDB)
# 3. Local development (requires local MongoDB)
```

### 📋 Manual Setup

If you prefer manual control:

```bash
# 1. Install dependencies
pnpm install

# 2. Copy and customize environment
cp .env.example .env
# Edit .env with your preferences

# 3. Start MongoDB (hybrid approach)
docker run -d --name mongodb-dev -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=password \
  mongo:7-jammy

# 4. Generate Prisma client
pnpm prisma:generate

# 5. Start development
pnpm dev
```

**💡 TIP:** The hybrid approach (Docker MongoDB + Local API) is recommended for fastest development.

## API Endpoints

### Health Check
- **GET** `/api/health`
- Returns API status, uptime, and version information
- No authentication required

### Authentication
- **POST** `/api/auth/login`
- Requires: username, password, 6-digit TOTP code
- Returns: JWT token with expiration
- Authentication required: No (this is the login endpoint)

### Token Validation
- **GET** `/api/validate-token`
- Validates JWT token and returns token information
- Rate limited: 5 requests per IP per hour (configurable)
- Returns: token validation status, IP address, and remaining requests
- Authentication required: Yes (Bearer token)

### Token Refresh
- **POST** `/api/auth/refresh`
- Refreshes access token using a valid refresh token
- Rate limited: Same as login (5 requests per IP per hour)
- Returns: new access token and refresh token pair
- Authentication required: No (requires refresh token in body)

### Demo Math Endpoint
- **GET** `/api/demo/math`
- Simple math operations demo (add, subtract, multiply, divide)
- Parameters: operation (add/subtract/multiply/divide), a (number), b (number)
- Rate limited: 5 requests per IP per hour (configurable)
- Returns: calculation result and operation details
- Authentication required: Yes (Bearer token)

### Documentation
- **GET** `/api/docs`
- Returns OpenAPI 3.0 specification
- **GET** `/docs` - Interactive Swagger UI

## Environment Variables

The setup scripts automatically generate a secure `.env` file. Manual configuration:

```env
# Authentication (auto-generated during setup)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=1h
AUTH_USERNAME=admin
AUTH_PASSWORD=secure-password-123
AUTH_2FA_SECRET=JBSWY3DPEHPK3PXP

# Application
NODE_ENV=development
API_BASE_URL=http://localhost:3000
RATE_LIMIT_MAX_REQUESTS=5

# Database (choose one)
MONGODB_URI=mongodb://localhost:27017/nextjs-api  # Hybrid (recommended)
# MONGODB_URI=mongodb://mongo:27017/nextjs-api    # Full Docker
# MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/db  # Production

# MongoDB Root Credentials (for Docker containers)
MONGO_ROOT_USER=admin
MONGO_ROOT_PASSWORD=password
```

**📄 See [MONGODB-SETUP.md](MONGODB-SETUP.md) for detailed database configuration**

## 2FA Setup

1. Use the `AUTH_2FA_SECRET` from your environment variables
2. Add it to Google Authenticator or any TOTP app:
   - Manual entry: Use the secret directly (e.g., `JBSWY3DPEHPK3PXP`)
   - Account name: "Next.js API Starter"
   - Issuer: "Starter Template"

## Development Commands

```bash
# Setup Commands
pnpm quick-setup      # Zero-config setup (recommended)
pnpm setup            # Interactive setup with options
pnpm init             # Alias for setup

# Development
pnpm dev              # Start development server
pnpm build            # Build for production
pnpm start            # Start production server
pnpm lint             # Run ESLint

# Docker Commands
pnpm docker:up        # Start all services
pnpm docker:down      # Stop all services
pnpm docker:logs      # View API logs

# Database Management
docker stop mongodb-dev      # Stop hybrid MongoDB
docker start mongodb-dev     # Start hybrid MongoDB
docker rm mongodb-dev        # Remove MongoDB container
```

## Code Structure Guidelines

### Services Layer
- Business logic and external integrations
- Pure functions when possible
- Dependency injection ready

### Controllers (API Routes)
- Thin layer handling HTTP requests/responses
- Input validation using Zod schemas
- Error handling with consistent response format

### Authentication Flow
1. Client sends username, password, and TOTP code
2. Server validates credentials against environment variables
3. Server verifies TOTP code using speakeasy
4. Server generates and returns JWT token
5. Client uses token in Authorization header for protected routes

### Response Format
All API responses follow this consistent format:
```typescript
{
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
```

## Security Features

- **JWT Authentication**: Stateless token-based authentication
- **2FA/TOTP**: Time-based one-time passwords for additional security
- **Input Validation**: Zod schemas for request validation
- **Environment Validation**: Runtime environment variable validation
- **Secure Headers**: Next.js built-in security headers
- **Password Security**: Environment-based credential storage

## Testing the API

### Using the Frontend Interface
1. Go to http://localhost:3000
2. Enter credentials (default: admin/secure-password-123)
3. Enter 6-digit TOTP code from your authenticator app
4. Click "Login" to get JWT token
5. Use "Check API Health" to test the health endpoint

### Using Swagger UI
1. Go to http://localhost:3000/docs
2. Try the health endpoint directly
3. For login, click "Try it out" and enter credentials
4. Copy the returned token for use in other protected endpoints

### Using cURL
```bash
# Health check
curl http://localhost:3000/api/health

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"secure-password-123","totpCode":"123456"}'
```

## Common Issues

1. **2FA Code Invalid**: Ensure your system time is synchronized
2. **Environment Variables**: Make sure .env.local exists and has all required variables
3. **Port Already in Use**: Change port with `pnpm dev -p 3001`

## How to Create New API Endpoints

This section provides a step-by-step guide for adding new endpoints to the API.

### Step 1: Create the Route File

Create a new `route.ts` file in the appropriate directory under `src/app/api/`:

```
src/app/api/your-endpoint/route.ts
```

### Step 2: Basic Endpoint Structure

Use this template for authenticated endpoints:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { JWTService } from '@/lib/auth/jwt';
import { getClientIp } from '@/lib/utils/getClientIp';
import { rateLimiter } from '@/lib/utils/rateLimiter';

/**
 * @swagger
 * /api/your-endpoint:
 *   get:
 *     summary: Brief description
 *     description: Detailed description
 *     tags:
 *       - YourCategory
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: param1
 *         required: false
 *         schema:
 *           type: string
 *           example: "example"
 *         description: Parameter description
 *     responses:
 *       200:
 *         description: Success response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     result:
 *                       type: string
 *                       example: "success"
 */

export async function GET(request: NextRequest) {
  // Get client IP for rate limiting
  const clientIp = getClientIp(request);
  
  try {
    // Check rate limit
    const rateLimitResult = rateLimiter.checkRateLimit(clientIp);
    
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: 'Rate limit exceeded',
          message: `Too many requests. Try again after ${rateLimitResult.resetTime.toISOString()}`,
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': '5',
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': Math.ceil(rateLimitResult.resetTime.getTime() / 1000).toString(),
          }
        }
      );
    }

    // Extract and validate JWT token
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing or invalid authorization header',
          message: 'Authorization header must be in format: Bearer <token>',
        },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    
    try {
      JWTService.verifyAccessToken(token);
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid token',
          message: 'The provided JWT token is invalid or expired',
        },
        { status: 401 }
      );
    }

    // Your endpoint logic here
    const { searchParams } = new URL(request.url);
    const param1 = searchParams.get('param1') || 'default';

    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: 'Operation completed successfully',
        data: {
          result: `Processed: ${param1}`,
          clientIp: clientIp,
          rateLimit: {
            remaining: rateLimitResult.remaining,
            resetTime: rateLimitResult.resetTime.toISOString()
          }
        }
      },
      {
        headers: {
          'X-RateLimit-Limit': '5',
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
          'X-RateLimit-Reset': Math.ceil(rateLimitResult.resetTime.getTime() / 1000).toString()
        }
      }
    );

  } catch {
    console.error('Endpoint failed from IP:', clientIp);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: 'An error occurred while processing your request'
      },
      { status: 500 }
    );
  }
}

// Handle unsupported methods
export async function POST() {
  return NextResponse.json(
    {
      success: false,
      error: 'Method not allowed',
      message: 'This endpoint only accepts GET requests'
    },
    { status: 405 }
  );
}
```

### Step 3: Public Endpoints (No Authentication)

For public endpoints like health checks, omit the JWT validation:

```typescript
export async function GET(request: NextRequest) {
  try {
    // Your endpoint logic here (no auth required)
    
    return NextResponse.json({
      success: true,
      data: { result: 'Public endpoint response' }
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: 'An error occurred'
      },
      { status: 500 }
    );
  }
}
```

### Step 4: Add Frontend Integration

To add the new endpoint to the frontend demo:

1. Add state variables in `src/app/page.tsx`:
```typescript
const [yourEndpointResult, setYourEndpointResult] = useState<object | null>(null);
const [yourEndpointLoading, setYourEndpointLoading] = useState(false);
```

2. Add a function to call the endpoint:
```typescript
const callYourEndpoint = async () => {
  if (!token) {
    alert('Please login first to get a token');
    return;
  }

  setYourEndpointLoading(true);
  try {
    const response = await fetch('/api/your-endpoint?param1=test', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    const data = await response.json();
    setYourEndpointResult(data);
    
    if (!data.success) {
      alert(`Endpoint failed: ${data.error}`);
    }
  } catch {
    alert('Endpoint failed: Network error');
  } finally {
    setYourEndpointLoading(false);
  }
};
```

3. Add a button to the UI:
```jsx
<button
  onClick={callYourEndpoint}
  disabled={yourEndpointLoading || !token}
  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-4 rounded-lg hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold"
>
  {yourEndpointLoading ? 'Processing...' : 'Test Your Endpoint'}
</button>
```

### Step 5: Key Patterns and Best Practices

1. **Rate Limiting**: All endpoints (except health) should use rate limiting
2. **Authentication**: Protected endpoints must validate JWT tokens
3. **Error Handling**: Always use try-catch and return consistent error formats
4. **Swagger Documentation**: Include comprehensive @swagger comments
5. **Input Validation**: Validate all input parameters
6. **Response Format**: Use consistent response structure:
   ```typescript
   {
     success: boolean;
     data?: any;
     error?: string;
     message?: string;
   }
   ```
7. **Security Headers**: Include rate limit headers in responses
8. **Method Handling**: Explicitly handle unsupported HTTP methods

### Example Real-World Endpoints

- **User Profile**: `GET /api/user/profile` - Get user information
- **Data CRUD**: `POST /api/data`, `GET /api/data/:id`, `PUT /api/data/:id`, `DELETE /api/data/:id`
- **File Upload**: `POST /api/upload` - File upload with validation
- **Search**: `GET /api/search?q=term` - Search functionality
- **Admin**: `GET /api/admin/users` - Admin-only endpoints with role validation

## Next Steps for Development

1. **Add more endpoints**: User management, data CRUD operations
2. **Database integration**: Add Prisma or similar ORM
3. **Role-based access**: Implement user roles and permissions
4. **Logging**: Add structured logging with winston or similar
5. **Testing**: Add unit and integration tests
6. **Docker**: Add containerization support
7. **CI/CD**: Add GitHub Actions or similar
8. **Monitoring**: Add health monitoring and alerting

## Production Deployment

Before deploying to production:

1. **Change default credentials** in environment variables
2. **Use strong JWT secret** (generate random 256-bit key)
3. **Enable HTTPS** for all communications
4. **Set up proper error monitoring**
5. **Configure rate limiting**
6. **Set up backup and recovery procedures**
7. **Review security headers** and CSP policies

## Contributing

This is an open source project. Contributions are welcome! Please feel free to submit issues and pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Authentication powered by [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken)
- 2FA implementation using [speakeasy](https://github.com/speakeasyjs/speakeasy)
- API documentation with [Swagger](https://swagger.io/)
- Created by Sergio Hidalgo with assistance from Claude Code (Claude-4 Model by Anthropic)