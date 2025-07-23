import { JWTService } from '@/lib/auth/jwt';
import jwt from 'jsonwebtoken';

describe('JWTService', () => {
  const testUsername = 'testuser';
  
  // ACID: Atomic - Token generation is complete or fails entirely
  describe('generateTokenPair', () => {
    it('should generate access and refresh tokens', () => {
      const result = JWTService.generateTokenPair(testUsername);
      
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(typeof result.accessToken).toBe('string');
      expect(typeof result.refreshToken).toBe('string');
      expect(result.accessToken).not.toBe(result.refreshToken);
    });

    // ACID: Consistent - Generated tokens are always valid JWT format
    it('should generate valid JWT tokens', () => {
      const { accessToken, refreshToken } = JWTService.generateTokenPair(testUsername);
      
      // Both tokens should have 3 parts separated by dots
      expect(accessToken.split('.')).toHaveLength(3);
      expect(refreshToken.split('.')).toHaveLength(3);
      
      // Should be decodeable (without verification for structure test)
      const accessPayload = jwt.decode(accessToken) as jwt.JwtPayload;
      const refreshPayload = jwt.decode(refreshToken) as jwt.JwtPayload;
      
      expect(accessPayload).toHaveProperty('username', testUsername);
      expect(accessPayload).toHaveProperty('type', 'access');
      expect(refreshPayload).toHaveProperty('username', testUsername);
      expect(refreshPayload).toHaveProperty('type', 'refresh');
    });

    // ACID: Isolated - Token generation for different users is independent
    it('should generate different tokens for different users', () => {
      const result1 = JWTService.generateTokenPair('user1');
      const result2 = JWTService.generateTokenPair('user2');
      
      expect(result1.accessToken).not.toBe(result2.accessToken);
      expect(result1.refreshToken).not.toBe(result2.refreshToken);
    });

    // ACID: Durability - Multiple calls produce different tokens (iat differs)
    it('should generate different tokens on subsequent calls', async () => {
      const result1 = JWTService.generateTokenPair(testUsername);
      
      // Wait a full second to ensure different timestamp
      await new Promise(resolve => setTimeout(resolve, 1100));
      
      const result2 = JWTService.generateTokenPair(testUsername);
      
      expect(result1.accessToken).not.toBe(result2.accessToken);
      expect(result1.refreshToken).not.toBe(result2.refreshToken);
    });
  });

  // ACID: Atomic - Token verification gives definitive result
  describe('verifyAccessToken', () => {
    let validToken: string;
    
    beforeEach(() => {
      const { accessToken } = JWTService.generateTokenPair(testUsername);
      validToken = accessToken;
    });

    it('should verify valid access token', () => {
      const payload = JWTService.verifyAccessToken(validToken);
      
      expect(payload).toHaveProperty('username', testUsername);
      expect(payload).toHaveProperty('type', 'access');
      expect(payload).toHaveProperty('iat');
      expect(payload).toHaveProperty('exp');
    });

    // ACID: Consistent - Invalid tokens always throw errors
    it('should throw error for invalid token', () => {
      expect(() => {
        JWTService.verifyAccessToken('invalid.token.here');
      }).toThrow();
    });

    it('should throw error for empty token', () => {
      expect(() => {
        JWTService.verifyAccessToken('');
      }).toThrow();
    });

    it('should throw error for refresh token used as access token', () => {
      const { refreshToken } = JWTService.generateTokenPair(testUsername);
      
      expect(() => {
        JWTService.verifyAccessToken(refreshToken);
      }).toThrow('Invalid token type');
    });

    // ACID: Isolated - Token verification doesn't affect token state
    it('should not modify token during verification', () => {
      const originalToken = validToken;
      JWTService.verifyAccessToken(validToken);
      
      expect(validToken).toBe(originalToken);
    });
  });

  // ACID: Atomic - Refresh token verification gives definitive result
  describe('verifyRefreshToken', () => {
    let validRefreshToken: string;
    
    beforeEach(() => {
      const { refreshToken } = JWTService.generateTokenPair(testUsername);
      validRefreshToken = refreshToken;
    });

    it('should verify valid refresh token', () => {
      const payload = JWTService.verifyRefreshToken(validRefreshToken);
      
      expect(payload).toHaveProperty('username', testUsername);
      expect(payload).toHaveProperty('type', 'refresh');
      expect(payload).toHaveProperty('iat');
      expect(payload).toHaveProperty('exp');
    });

    // ACID: Consistent - Invalid refresh tokens always throw errors
    it('should throw error for invalid refresh token', () => {
      expect(() => {
        JWTService.verifyRefreshToken('invalid.token.here');
      }).toThrow();
    });

    it('should throw error for access token used as refresh token', () => {
      const { accessToken } = JWTService.generateTokenPair(testUsername);
      
      expect(() => {
        JWTService.verifyRefreshToken(accessToken);
      }).toThrow('Invalid token type');
    });
  });

  // Integration test - Full token lifecycle
  describe('token lifecycle integration', () => {
    it('should handle complete generate-verify cycle', () => {
      const { accessToken, refreshToken } = JWTService.generateTokenPair(testUsername);
      
      // Both tokens should verify successfully
      const accessPayload = JWTService.verifyAccessToken(accessToken);
      const refreshPayload = JWTService.verifyRefreshToken(refreshToken);
      
      expect(accessPayload.username).toBe(testUsername);
      expect(refreshPayload.username).toBe(testUsername);
      expect(accessPayload.type).toBe('access');
      expect(refreshPayload.type).toBe('refresh');
    });

    // ACID: Durability - Token expiration times are correct
    it('should have correct expiration times', () => {
      const beforeGeneration = Math.floor(Date.now() / 1000);
      const { accessToken, refreshToken } = JWTService.generateTokenPair(testUsername);
      const afterGeneration = Math.floor(Date.now() / 1000);
      
      const accessPayload = JWTService.verifyAccessToken(accessToken);
      const refreshPayload = JWTService.verifyRefreshToken(refreshToken);
      
      // Access token should expire in 15 minutes (900 seconds)
      expect(accessPayload.exp - accessPayload.iat).toBe(900);
      
      // Refresh token should expire in 7 days (604800 seconds)
      expect(refreshPayload.exp - refreshPayload.iat).toBe(604800);
      
      // iat should be around current time
      expect(accessPayload.iat).toBeGreaterThanOrEqual(beforeGeneration);
      expect(accessPayload.iat).toBeLessThanOrEqual(afterGeneration);
    });

    // Performance test
    it('should handle multiple token operations efficiently', () => {
      const startTime = Date.now();
      
      // Generate and verify multiple token pairs
      for (let i = 0; i < 10; i++) {
        const { accessToken, refreshToken } = JWTService.generateTokenPair(`user${i}`);
        JWTService.verifyAccessToken(accessToken);
        JWTService.verifyRefreshToken(refreshToken);
      }
      
      const endTime = Date.now();
      expect(endTime - startTime).toBeLessThan(100); // Should complete in under 100ms
    });
  });
});