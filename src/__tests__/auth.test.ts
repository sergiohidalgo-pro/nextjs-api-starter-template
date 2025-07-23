import { AuthService } from '@/services/authService';
import { JWTService } from '@/lib/auth/jwt';
import { TOTPService } from '@/lib/auth/totp';
import { PasswordService } from '@/lib/auth/password';

// Mock dependencies
jest.mock('@/lib/config/env', () => ({
  env: {
    AUTH_USERNAME: 'testuser',
    AUTH_PASSWORD: 'testpassword',
    JWT_SECRET: 'test-jwt-secret-key-for-testing-purposes-only',
    AUTH_2FA_SECRET: 'JBSWY3DPEHPK3PXP',
  }
}));

jest.mock('@/lib/auth/totp');
jest.mock('@/lib/auth/password');

const mockTOTPService = TOTPService as jest.Mocked<typeof TOTPService>;
const mockPasswordService = PasswordService as jest.Mocked<typeof PasswordService>;

describe('Authentication System', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('AuthService', () => {
    describe('authenticate', () => {
      it('should authenticate successfully with valid credentials', async () => {
        // Setup mocks
        mockPasswordService.compare.mockResolvedValue(true);
        mockTOTPService.verifyToken.mockReturnValue(true);

        const credentials = {
          username: 'testuser',
          password: 'testpassword',
          totpCode: '123456'
        };

        const result = await AuthService.authenticate(credentials);

        expect(result).toHaveProperty('accessToken');
        expect(result).toHaveProperty('refreshToken');
        expect(result).toHaveProperty('expiresIn', '15m');
        expect(result).toHaveProperty('tokenType', 'Bearer');
        expect(mockTOTPService.verifyToken).toHaveBeenCalledWith('123456');
      });

      it('should handle plain text passwords in development', async () => {
        mockTOTPService.verifyToken.mockReturnValue(true);

        const credentials = {
          username: 'testuser',
          password: 'testpassword', // This matches the mocked plain text password
          totpCode: '123456'
        };

        const result = await AuthService.authenticate(credentials);
        expect(result).toHaveProperty('accessToken');
      });

      it('should handle bcrypt hashed passwords in production', async () => {
        // Test the bcrypt path by mocking the environment value to start with $2
        const originalEnv = require('@/lib/config/env').env;
        require('@/lib/config/env').env.AUTH_PASSWORD = '$2b$12$hashedpasswordhere';

        mockPasswordService.compare.mockResolvedValue(true);
        mockTOTPService.verifyToken.mockReturnValue(true);

        const credentials = {
          username: 'testuser',
          password: 'plaintext',
          totpCode: '123456'
        };

        const result = await AuthService.authenticate(credentials);
        expect(result).toHaveProperty('accessToken');
        expect(mockPasswordService.compare).toHaveBeenCalledWith('plaintext', '$2b$12$hashedpasswordhere');

        // Restore original environment
        require('@/lib/config/env').env.AUTH_PASSWORD = originalEnv.AUTH_PASSWORD;
      });

      it('should reject invalid username', async () => {
        const credentials = {
          username: 'wronguser',
          password: 'testpassword',
          totpCode: '123456'
        };

        await expect(AuthService.authenticate(credentials))
          .rejects.toThrow('Invalid username or password');
      });

      it('should reject invalid password', async () => {
        mockPasswordService.compare.mockResolvedValue(false);

        const credentials = {
          username: 'testuser',
          password: 'wrongpassword',
          totpCode: '123456'
        };

        await expect(AuthService.authenticate(credentials))
          .rejects.toThrow('Invalid username or password');
      });

      it('should reject invalid TOTP code', async () => {
        mockPasswordService.compare.mockResolvedValue(true);
        mockTOTPService.verifyToken.mockReturnValue(false);

        const credentials = {
          username: 'testuser',
          password: 'testpassword',
          totpCode: '000000'
        };

        await expect(AuthService.authenticate(credentials))
          .rejects.toThrow('Invalid 2FA code');
      });
    });
  });

  describe('JWTService', () => {
    const testUsername = 'testuser';

    describe('generateTokenPair', () => {
      it('should generate access and refresh tokens', () => {
        const tokens = JWTService.generateTokenPair(testUsername);

        expect(tokens).toHaveProperty('accessToken');
        expect(tokens).toHaveProperty('refreshToken');
        expect(typeof tokens.accessToken).toBe('string');
        expect(typeof tokens.refreshToken).toBe('string');
      });
    });

    describe('verifyAccessToken', () => {
      it('should verify valid access token', () => {
        const accessToken = JWTService.generateAccessToken(testUsername);
        const payload = JWTService.verifyAccessToken(accessToken);

        expect(payload.username).toBe(testUsername);
        expect(payload.type).toBe('access');
      });

      it('should reject refresh token as access token', () => {
        const refreshToken = JWTService.generateRefreshToken(testUsername);

        expect(() => JWTService.verifyAccessToken(refreshToken))
          .toThrow('Invalid token type');
      });

      it('should reject invalid token', () => {
        expect(() => JWTService.verifyAccessToken('invalid-token'))
          .toThrow('Invalid or expired token');
      });
    });

    describe('verifyRefreshToken', () => {
      it('should verify valid refresh token', () => {
        const refreshToken = JWTService.generateRefreshToken(testUsername);
        const payload = JWTService.verifyRefreshToken(refreshToken);

        expect(payload.username).toBe(testUsername);
        expect(payload.type).toBe('refresh');
      });

      it('should reject access token as refresh token', () => {
        const accessToken = JWTService.generateAccessToken(testUsername);

        expect(() => JWTService.verifyRefreshToken(accessToken))
          .toThrow('Invalid token type');
      });
    });

    describe('extractTokenFromHeader', () => {
      it('should extract token from valid Bearer header', () => {
        const token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9';
        const header = `Bearer ${token}`;

        const extracted = JWTService.extractTokenFromHeader(header);
        expect(extracted).toBe(token);
      });

      it('should reject missing authorization header', () => {
        expect(() => JWTService.extractTokenFromHeader(null))
          .toThrow('Invalid authorization header');
      });

      it('should reject invalid authorization header format', () => {
        expect(() => JWTService.extractTokenFromHeader('Basic dGVzdA=='))
          .toThrow('Invalid authorization header');
      });
    });
  });

  describe('PasswordService', () => {
    it('should hash passwords securely', async () => {
      // Use real PasswordService for this test
      const { PasswordService: RealPasswordService } = await import('@/lib/auth/password');
      const password = 'test-password-123';
      
      const hash = await RealPasswordService.hash(password);
      expect(hash).toMatch(/^\$2b\$12\$/); // bcrypt hash format
      expect(hash).not.toBe(password);
    });

    it('should verify correct passwords', async () => {
      const { PasswordService: RealPasswordService } = await import('@/lib/auth/password');
      const password = 'test-password-123';
      
      const hash = await RealPasswordService.hash(password);
      const isValid = await RealPasswordService.compare(password, hash);
      
      expect(isValid).toBe(true);
    });

    it('should reject incorrect passwords', async () => {
      const { PasswordService: RealPasswordService } = await import('@/lib/auth/password');
      const password = 'test-password-123';
      const wrongPassword = 'wrong-password';
      
      const hash = await RealPasswordService.hash(password);
      const isValid = await RealPasswordService.compare(wrongPassword, hash);
      
      expect(isValid).toBe(false);
    });
  });
});