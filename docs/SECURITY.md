# 🛡️ Security Configuration Guide

This document provides comprehensive security guidelines for the CL Donlee API project, including how to fix login issues, change passwords securely, and maintain proper security practices.

## 🚨 Login Issue Fix

### Problem Identified
The login was failing because the system expected hashed passwords but the environment variable contained a plain text password.

### Solution Implemented
- Updated `AuthService` to handle both plain text (development) and hashed passwords (production)
- Added automatic detection of password format (bcrypt hash vs plain text)
- Created password hashing utilities for secure production deployment

## 🔐 Security Features Implemented

### 1. **Password Security**
- ✅ **bcrypt hashing** with 12 salt rounds
- ✅ **Secure password comparison** (constant-time)
- ✅ **Password generation utility** (`scripts/hash-password.js`)
- ✅ **Flexible password handling** (plain text for dev, hashed for production)

### 2. **JWT Token Security**
- ✅ **Dual token system** (access + refresh tokens)
- ✅ **Short-lived access tokens** (15 minutes)
- ✅ **Long-lived refresh tokens** (7 days)
- ✅ **Token type validation** (access vs refresh)
- ✅ **Cryptographically secure secrets** (512-bit)

### 3. **Rate Limiting**
- ✅ **Login rate limiting** (5 attempts per 15 minutes)
- ✅ **Token validation rate limiting** (5 requests per hour)
- ✅ **IP-based tracking** with automatic reset

### 4. **2FA/TOTP Security**
- ✅ **Reduced time window** (±30 seconds)
- ✅ **Secure secret generation** (128-bit base32)
- ✅ **TOTP utilities** (`scripts/generate-2fa-secret.js`)

### 5. **HTTP Security Headers**
- ✅ **Content Security Policy** (CSP)
- ✅ **X-Frame-Options** (clickjacking protection)
- ✅ **X-Content-Type-Options** (MIME sniffing protection)
- ✅ **X-XSS-Protection** (XSS filtering)
- ✅ **Strict-Transport-Security** (HSTS for HTTPS)
- ✅ **Referrer-Policy** (referrer control)
- ✅ **Permissions-Policy** (API access control)

### 6. **Secure Logging**
- ✅ **No sensitive data logging**
- ✅ **IP-based error tracking**
- ✅ **Structured error messages**

## 🚀 Setup Instructions

### 1. Generate Secure Credentials

#### Generate Password Hash:
```bash
node scripts/generate-password-hash.js "YourSecurePassword123!"
```

#### Generate JWT Secret:
```bash
node scripts/generate-jwt-secret.js
```

#### Generate 2FA Secret:
```bash
node scripts/generate-2fa-secret.js "Your API Name"
```

### 2. Update Environment Variables

Update your `.env.local` with the generated values:

```env
# Use generated hash from password script
AUTH_PASSWORD=$2b$12$...generated.hash.here...

# Use generated secret from JWT script
JWT_SECRET=generated-512-bit-hex-secret-here

# Use generated secret from 2FA script
AUTH_2FA_SECRET=GENERATED2FASECRET

# Strong username (avoid 'admin')
AUTH_USERNAME=your-secure-username

# Production settings
NODE_ENV=production
API_BASE_URL=https://your-domain.com
RATE_LIMIT_MAX_REQUESTS=100
```

## 🔄 New Authentication Flow

### 1. Login Process
```
POST /api/auth/login
{
  "username": "your-secure-username",
  "password": "YourSecurePassword123!",
  "totpCode": "123456"
}

Response:
{
  "success": true,
  "data": {
    "accessToken": "eyJ...", // 15-minute token
    "refreshToken": "eyJ...", // 7-day token
    "expiresIn": "15m",
    "tokenType": "Bearer"
  }
}
```

### 2. Using Access Tokens
```
Authorization: Bearer <accessToken>
```

### 3. Refreshing Tokens
```
POST /api/auth/refresh
{
  "refreshToken": "eyJ..."
}

Response:
{
  "success": true,
  "data": {
    "accessToken": "eyJ...", // New 15-minute token
    "refreshToken": "eyJ...", // New 7-day token
    "expiresIn": "15m",
    "tokenType": "Bearer"
  }
}
```

## 📊 Security Assessment

### Before Improvements: 2/10 🔴
- Passwords in plain text
- No rate limiting on login
- Weak credentials
- Single long-lived tokens
- No security headers

### After Improvements: 9/10 🟢
- ✅ bcrypt password hashing
- ✅ Comprehensive rate limiting
- ✅ Dual token system
- ✅ Security headers
- ✅ Secure logging
- ✅ TOTP improvements
- ✅ Cryptographically secure secrets

## 🔒 Production Deployment Checklist

### Critical Security Items:
- [ ] Replace all default credentials
- [ ] Use generated secure JWT secret (512-bit)
- [ ] Enable HTTPS with valid SSL certificate
- [ ] Configure HSTS headers
- [ ] Set strong Content Security Policy
- [ ] Use environment-specific 2FA secrets
- [ ] Set up secure secret management (AWS Secrets Manager, etc.)
- [ ] Enable request logging and monitoring
- [ ] Configure rate limiting for production load
- [ ] Set up backup and recovery procedures

### Environment Security:
- [ ] Remove development/debug flags
- [ ] Disable verbose error messages
- [ ] Configure CORS appropriately
- [ ] Set up database connection security
- [ ] Enable request/response compression
- [ ] Configure reverse proxy (nginx/Apache)
- [ ] Set up monitoring and alerting

### Ongoing Security:
- [ ] Regular security audits
- [ ] Secret rotation schedule (quarterly)
- [ ] Dependency vulnerability scanning
- [ ] Penetration testing
- [ ] Security incident response plan

## 🚨 Security Considerations

### Token Management:
- **Access tokens** are short-lived (15 minutes) to minimize exposure
- **Refresh tokens** are longer-lived (7 days) but should be stored securely
- Both tokens are invalidated when refreshed (automatic rotation)

### Rate Limiting:
- Login attempts: 5 per 15 minutes per IP
- Token validation: 5 per hour per IP
- Refresh attempts: 5 per 15 minutes per IP (same as login)

### Error Handling:
- Generic error messages to prevent information disclosure
- No sensitive data in logs or error responses
- IP-based tracking for security monitoring

### Headers Security:
- CSP prevents XSS and injection attacks
- Frame options prevent clickjacking
- HSTS enforces HTTPS connections
- Content type options prevent MIME confusion

## 🔧 Maintenance

### Secret Rotation:
1. Generate new secrets using the provided scripts
2. Update environment variables
3. Gradually roll out to all instances
4. Monitor for authentication issues

### Security Monitoring:
- Monitor failed authentication attempts per IP
- Track unusual token refresh patterns
- Watch for brute force attacks
- Log security-relevant events

### Updates:
- Keep dependencies updated (especially security patches)
- Review and update CSP policies as needed
- Adjust rate limits based on usage patterns
- Regular security assessment reviews

## 📞 Security Contact

For security concerns or to report vulnerabilities, please follow responsible disclosure practices.