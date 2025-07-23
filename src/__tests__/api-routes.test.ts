import { NextRequest } from 'next/server';
import { POST as loginHandler } from '@/app/api/auth/login/route';
import { GET as validateTokenHandler } from '@/app/api/validate-token/route';
import { POST as changePasswordHandler } from '@/app/api/auth/change-password/route';
import { JWTService } from '@/lib/auth/jwt';

// Mock dependencies
jest.mock('@/lib/config/env', () => ({
  env: {
    AUTH_USERNAME: 'testuser',
    AUTH_PASSWORD: 'testpassword',
    JWT_SECRET: 'test-jwt-secret-key-for-testing-purposes-only',
    AUTH_2FA_SECRET: 'JBSWY3DPEHPK3PXP',
  }
}));

jest.mock('@/lib/auth/totp', () => ({
  TOTPService: {
    verifyToken: jest.fn(() => true),
  }
}));

jest.mock('@/lib/utils/rateLimiter', () => ({
  loginRateLimiter: {
    checkRateLimit: jest.fn(() => ({
      allowed: true,
      remaining: 4,
      resetTime: new Date(Date.now() + 900000)
    }))
  },
  rateLimiter: {
    checkRateLimit: jest.fn(() => ({
      allowed: true,
      remaining: 4,
      resetTime: new Date(Date.now() + 3600000)
    }))
  }
}));

jest.mock('@/lib/utils/getClientIp', () => ({
  getClientIp: jest.fn(() => '127.0.0.1')
}));

// Helper function to create mock NextRequest
function createMockRequest(body: any, headers: Record<string, string> = {}) {
  return {
    json: async () => body,
    headers: {
      get: (name: string) => headers[name.toLowerCase()] || null,
    },
    url: 'http://localhost:3000/api/test',
  } as NextRequest;
}

describe('API Routes', () => {
  describe('POST /api/auth/login', () => {
    it('should login successfully with valid credentials', async () => {
      const request = createMockRequest({
        username: 'testuser',
        password: 'testpassword',
        totpCode: '123456'
      });

      const response = await loginHandler(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('accessToken');
      expect(data.data).toHaveProperty('refreshToken');
      expect(data.message).toBe('Authentication successful');
    });

    it('should reject invalid credentials', async () => {
      const request = createMockRequest({
        username: 'wronguser',
        password: 'testpassword',
        totpCode: '123456'
      });

      const response = await loginHandler(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Invalid username or password');
    });

    it('should reject missing fields', async () => {
      const request = createMockRequest({
        username: 'testuser',
        password: 'testpassword'
        // missing totpCode
      });

      const response = await loginHandler(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Validation failed');
    });

    it('should enforce rate limiting', async () => {
      const mockRateLimiter = require('@/lib/utils/rateLimiter').loginRateLimiter;
      mockRateLimiter.checkRateLimit.mockReturnValueOnce({
        allowed: false,
        remaining: 0,
        resetTime: new Date(Date.now() + 900000)
      });

      const request = createMockRequest({
        username: 'testuser',
        password: 'testpassword',
        totpCode: '123456'
      });

      const response = await loginHandler(request);
      const data = await response.json();

      expect(response.status).toBe(429);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Rate limit exceeded');
    });
  });

  describe('GET /api/validate-token', () => {
    it('should validate valid token', async () => {
      const token = JWTService.generateAccessToken('testuser');
      const request = createMockRequest(null, {
        'authorization': `Bearer ${token}`
      });

      const response = await validateTokenHandler(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('tokenValid', true);
      expect(data.data.tokenPayload).toHaveProperty('username', 'testuser');
    });

    it('should reject missing authorization header', async () => {
      const request = createMockRequest(null);

      const response = await validateTokenHandler(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Missing or invalid authorization header');
    });

    it('should reject invalid token', async () => {
      const request = createMockRequest(null, {
        'authorization': 'Bearer invalid-token'
      });

      const response = await validateTokenHandler(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Invalid token');
    });

    it('should reject refresh token for access endpoint', async () => {
      const refreshToken = JWTService.generateRefreshToken('testuser');
      const request = createMockRequest(null, {
        'authorization': `Bearer ${refreshToken}`
      });

      const response = await validateTokenHandler(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Invalid token');
    });
  });

  describe('POST /api/auth/change-password', () => {
    it('should change password successfully', async () => {
      const token = JWTService.generateAccessToken('testuser');
      const request = createMockRequest({
        currentPassword: 'testpassword',
        newPassword: 'newsecurepassword123',
        totpCode: '123456'
      }, {
        'authorization': `Bearer ${token}`
      });

      const response = await changePasswordHandler(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe('Password changed successfully');
      expect(data.data).toHaveProperty('hashedPassword');
      expect(data.data.hashedPassword).toMatch(/^\$2b\$12\$/);
    });

    it('should reject without valid token', async () => {
      const request = createMockRequest({
        currentPassword: 'testpassword',
        newPassword: 'newsecurepassword123',
        totpCode: '123456'
      });

      const response = await changePasswordHandler(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Missing or invalid authorization header');
    });

    it('should reject wrong current password', async () => {
      const token = JWTService.generateAccessToken('testuser');
      const request = createMockRequest({
        currentPassword: 'wrongpassword',
        newPassword: 'newsecurepassword123',
        totpCode: '123456'
      }, {
        'authorization': `Bearer ${token}`
      });

      const response = await changePasswordHandler(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Invalid current password');
    });

    it('should validate new password strength', async () => {
      const token = JWTService.generateAccessToken('testuser');
      const request = createMockRequest({
        currentPassword: 'testpassword',
        newPassword: 'weak', // Too short
        totpCode: '123456'
      }, {
        'authorization': `Bearer ${token}`
      });

      const response = await changePasswordHandler(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Validation failed');
      expect(data.message).toContain('at least 8 characters');
    });

    it('should validate TOTP code', async () => {
      const mockTOTPService = require('@/lib/auth/totp').TOTPService;
      mockTOTPService.verifyToken.mockReturnValueOnce(false);

      const token = JWTService.generateAccessToken('testuser');
      const request = createMockRequest({
        currentPassword: 'testpassword',
        newPassword: 'newsecurepassword123',
        totpCode: '000000'
      }, {
        'authorization': `Bearer ${token}`
      });

      const response = await changePasswordHandler(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Invalid 2FA code');
    });
  });
});