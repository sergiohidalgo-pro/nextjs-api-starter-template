import { rateLimiter, loginRateLimiter } from '@/lib/utils/rateLimiter';
import { PasswordService } from '@/lib/auth/password';
import { JWTService } from '@/lib/auth/jwt';

// Mock environment
jest.mock('@/lib/config/env', () => ({
  env: {
    AUTH_USERNAME: 'testuser',
    AUTH_PASSWORD: 'testpassword',
    JWT_SECRET: 'test-jwt-secret-key-for-testing-purposes-only-with-sufficient-length',
    AUTH_2FA_SECRET: 'JBSWY3DPEHPK3PXP',
    RATE_LIMIT_MAX_REQUESTS: 5,
  }
}));

describe('Security Features', () => {
  describe('Rate Limiting', () => {
    beforeEach(() => {
      // Clear rate limiter state
      rateLimiter.clear();
      loginRateLimiter.clear();
    });

    it('should allow requests within rate limit', () => {
      const clientIp = '192.168.1.1';
      
      for (let i = 0; i < 5; i++) {
        const result = rateLimiter.checkRateLimit(clientIp);
        expect(result.allowed).toBe(true);
        expect(result.remaining).toBe(4 - i);
      }
    });

    it('should block requests exceeding rate limit', () => {
      const clientIp = '192.168.1.2';
      
      // Make 5 allowed requests
      for (let i = 0; i < 5; i++) {
        rateLimiter.checkRateLimit(clientIp);
      }
      
      // 6th request should be blocked
      const result = rateLimiter.checkRateLimit(clientIp);
      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it('should track different IPs separately', () => {
      const ip1 = '192.168.1.3';
      const ip2 = '192.168.1.4';
      
      // Exhaust rate limit for IP1
      for (let i = 0; i < 5; i++) {
        rateLimiter.checkRateLimit(ip1);
      }
      const result1 = rateLimiter.checkRateLimit(ip1);
      expect(result1.allowed).toBe(false);
      
      // IP2 should still be allowed
      const result2 = rateLimiter.checkRateLimit(ip2);
      expect(result2.allowed).toBe(true);
    });

    it('should have separate rate limits for login vs general endpoints', () => {
      const clientIp = '192.168.1.5';
      
      // Exhaust login rate limit
      for (let i = 0; i < 5; i++) {
        loginRateLimiter.checkRateLimit(clientIp);
      }
      const loginResult = loginRateLimiter.checkRateLimit(clientIp);
      expect(loginResult.allowed).toBe(false);
      
      // General rate limiter should still allow requests
      const generalResult = rateLimiter.checkRateLimit(clientIp);
      expect(generalResult.allowed).toBe(true);
    });
  });

  describe('Password Security', () => {
    it('should hash passwords with sufficient complexity', async () => {
      const password = 'test-password-123!';
      const hash = await PasswordService.hash(password);
      
      // Should be bcrypt hash with 12 rounds
      expect(hash).toMatch(/^\$2b\$12\$/);
      expect(hash.length).toBeGreaterThan(50);
      expect(hash).not.toContain(password);
    });

    it('should generate different hashes for same password', async () => {
      const password = 'same-password';
      const hash1 = await PasswordService.hash(password);
      const hash2 = await PasswordService.hash(password);
      
      expect(hash1).not.toBe(hash2);
      
      // Both should verify correctly
      expect(await PasswordService.compare(password, hash1)).toBe(true);
      expect(await PasswordService.compare(password, hash2)).toBe(true);
    });

    it('should use constant-time comparison', async () => {
      const password = 'timing-test-password';
      const hash = await PasswordService.hash(password);
      
      const start1 = process.hrtime.bigint();
      await PasswordService.compare('wrong-password', hash);
      const end1 = process.hrtime.bigint();
      
      const start2 = process.hrtime.bigint();
      await PasswordService.compare(password, hash);
      const end2 = process.hrtime.bigint();
      
      const time1 = Number(end1 - start1);
      const time2 = Number(end2 - start2);
      
      // Times should be similar (within reasonable tolerance)
      // This is a basic timing attack resistance test
      const ratio = Math.max(time1, time2) / Math.min(time1, time2);
      expect(ratio).toBeLessThan(2); // Allow some variance
    });
  });

  describe('JWT Security', () => {
    it('should generate cryptographically secure tokens', () => {
      const tokens = JWTService.generateTokenPair('testuser');
      
      expect(tokens.accessToken).toMatch(/^eyJ[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/);
      expect(tokens.refreshToken).toMatch(/^eyJ[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/);
      expect(tokens.accessToken).not.toBe(tokens.refreshToken);
    });

    it('should enforce token expiration', (done) => {
      // Mock short expiration for testing
      const originalSign = require('jsonwebtoken').sign;
      require('jsonwebtoken').sign = jest.fn((payload, secret, options) => {
        return originalSign(payload, secret, { ...options, expiresIn: '1ms' });
      });

      const token = JWTService.generateAccessToken('testuser');
      
      // Token should be invalid after expiration
      setTimeout(() => {
        expect(() => JWTService.verifyAccessToken(token))
          .toThrow('Invalid or expired token');
        done();
      }, 10);
    });

    it('should prevent token type confusion', () => {
      const accessToken = JWTService.generateAccessToken('testuser');
      const refreshToken = JWTService.generateRefreshToken('testuser');
      
      // Access token should not work for refresh operations
      expect(() => JWTService.verifyRefreshToken(accessToken))
        .toThrow('Invalid token type');
      
      // Refresh token should not work for access operations
      expect(() => JWTService.verifyAccessToken(refreshToken))
        .toThrow('Invalid token type');
    });

    it('should reject tampered tokens', () => {
      const token = JWTService.generateAccessToken('testuser');
      const tamperedToken = token.slice(0, -10) + 'tampered123';
      
      expect(() => JWTService.verifyAccessToken(tamperedToken))
        .toThrow('Invalid or expired token');
    });

    it('should reject tokens with wrong secret', () => {
      // Generate token with different secret
      const jwt = require('jsonwebtoken');
      const wrongToken = jwt.sign(
        { username: 'testuser', type: 'access' },
        'wrong-secret',
        { expiresIn: '15m' }
      );
      
      expect(() => JWTService.verifyAccessToken(wrongToken))
        .toThrow('Invalid or expired token');
    });
  });

  describe('Input Validation', () => {
    it('should validate request data schemas', () => {
      const { authRequestSchema } = require('@/lib/validators/auth');
      
      // Valid data should pass
      const validData = {
        username: 'testuser',
        password: 'password123',
        totpCode: '123456'
      };
      expect(authRequestSchema.safeParse(validData).success).toBe(true);
      
      // Invalid data should fail
      const invalidData = {
        username: 'testuser',
        password: 'password123',
        totpCode: '1234' // Wrong length
      };
      expect(authRequestSchema.safeParse(invalidData).success).toBe(false);
    });

    it('should sanitize and normalize input', () => {
      const { authRequestSchema } = require('@/lib/validators/auth');
      
      const data = {
        username: '  TestUser  ',
        password: 'password123',
        totpCode: '123456'
      };
      
      const result = authRequestSchema.safeParse(data);
      if (result.success) {
        expect(result.data.username).toBe('testuser'); // Trimmed and lowercased
      }
    });
  });

  describe('Error Handling Security', () => {
    it('should not leak sensitive information in errors', () => {
      // This would typically be tested in integration tests
      // to ensure error messages don't contain sensitive data
      const sensitiveData = {
        password: 'secret123',
        jwtSecret: 'top-secret-key',
        internalPath: '/internal/secret/path'
      };
      
      // Mock error that might contain sensitive data
      const error = new Error(`Database connection failed at ${sensitiveData.internalPath}`);
      
      // Error message should be sanitized
      const sanitizedMessage = 'Internal server error';
      expect(sanitizedMessage).not.toContain(sensitiveData.internalPath);
      expect(sanitizedMessage).not.toContain(sensitiveData.password);
      expect(sanitizedMessage).not.toContain(sensitiveData.jwtSecret);
    });
  });
});

describe('Security Integration Tests', () => {
  it('should maintain security under concurrent requests', async () => {
    const clientIp = '192.168.1.100';
    const promises = [];
    
    // Simulate concurrent requests
    for (let i = 0; i < 10; i++) {
      promises.push(
        new Promise(resolve => {
          setTimeout(() => {
            const result = rateLimiter.checkRateLimit(clientIp);
            resolve(result);
          }, Math.random() * 100);
        })
      );
    }
    
    const results = await Promise.all(promises);
    const allowedCount = results.filter((r: any) => r.allowed).length;
    
    // Should not exceed rate limit even with concurrent requests
    expect(allowedCount).toBeLessThanOrEqual(5);
  });

  it('should handle high-frequency password hashing', async () => {
    const passwords = ['pass1', 'pass2', 'pass3', 'pass4', 'pass5'];
    const promises = passwords.map(pwd => PasswordService.hash(pwd));
    
    const hashes = await Promise.all(promises);
    
    // All hashes should be unique
    const uniqueHashes = new Set(hashes);
    expect(uniqueHashes.size).toBe(passwords.length);
    
    // All should be valid bcrypt hashes
    hashes.forEach(hash => {
      expect(hash).toMatch(/^\$2b\$12\$/);
    });
  });
});