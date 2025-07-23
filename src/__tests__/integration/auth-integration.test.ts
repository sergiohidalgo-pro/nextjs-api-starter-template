import { AuthService } from '@/services/authService';
import { PasswordService } from '@/lib/auth/password';

// Override environment for testing
process.env.NODE_ENV = 'test';
process.env.AUTH_USERNAME = 'admin';
process.env.AUTH_PASSWORD = '$2b$12$QsKfJqkspO38CEMC79.3wOmQH1EpIvijUXiRbH.D31Fzwrtsnue3m'; // Hash for 'secure-password-123'
process.env.AUTH_2FA_SECRET = 'JBSWY3DPEHPK3PXP';
process.env.JWT_SECRET = 'test-secret-key-for-integration-testing';
process.env.JWT_EXPIRES_IN = '15m';
process.env.PORT = '3000';
process.env.RATE_LIMIT_MAX_REQUESTS = '5';

// Mock TOTP service for predictable testing
jest.mock('@/lib/auth/totp', () => ({
  TOTPService: {
    verifyToken: jest.fn((code: string) => {
      // Return true for valid test codes, false otherwise
      return ['123456', '654321', '111111'].includes(code);
    })
  }
}));

describe('Authentication Integration Tests', () => {
  describe('Password Hash Validation', () => {
    it('should verify the production password hash works correctly', async () => {
      const password = 'secure-password-123';
      const hash = '$2b$12$QsKfJqkspO38CEMC79.3wOmQH1EpIvijUXiRbH.D31Fzwrtsnue3m';
      
      const isValid = await PasswordService.compare(password, hash);
      expect(isValid).toBe(true);
      
      console.log('✅ Production password hash validation: PASSED');
    });

    it('should reject incorrect password with production hash', async () => {
      const wrongPassword = 'wrong-password';
      const hash = '$2b$12$QsKfJqkspO38CEMC79.3wOmQH1EpIvijUXiRbH.D31Fzwrtsnue3m';
      
      const isValid = await PasswordService.compare(wrongPassword, hash);
      expect(isValid).toBe(false);
      
      console.log('✅ Wrong password rejection: PASSED');
    });

    it('should generate and verify new hashes correctly', async () => {
      const password = 'test-password-123';
      
      // Generate new hash
      const hash = await PasswordService.hash(password);
      
      // Verify it starts with bcrypt prefix
      expect(hash).toMatch(/^\$2[aby]\$\d+\$/);
      
      // Verify the password matches the hash
      const isValid = await PasswordService.compare(password, hash);
      expect(isValid).toBe(true);
      
      console.log('✅ New hash generation and verification: PASSED');
      console.log('Generated hash:', hash);
    });
  });

  describe('Complete Authentication Flow', () => {
    it('should authenticate successfully with correct credentials', async () => {
      const credentials = {
        username: 'admin',
        password: 'secure-password-123',
        totpCode: '123456' // This will return true from our mock
      };

      // Debug environment
      console.log('🔍 TEST DEBUG - Environment check:');
      console.log('AUTH_USERNAME:', process.env.AUTH_USERNAME);
      console.log('AUTH_PASSWORD:', process.env.AUTH_PASSWORD);
      console.log('NODE_ENV:', process.env.NODE_ENV);

      const result = await AuthService.authenticate(credentials);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.expiresIn).toBe('15m');
      expect(result.tokenType).toBe('Bearer');
      
      console.log('✅ Complete authentication flow: PASSED');
      console.log('Generated tokens:', {
        accessToken: result.accessToken.substring(0, 20) + '...',
        refreshToken: result.refreshToken.substring(0, 20) + '...'
      });
    });

    it('should fail with incorrect password', async () => {
      const credentials = {
        username: 'admin',
        password: 'wrong-password',
        totpCode: '123456'
      };

      await expect(AuthService.authenticate(credentials))
        .rejects
        .toThrow('Invalid username or password');
      
      console.log('✅ Incorrect password rejection: PASSED');
    });

    it('should fail with incorrect username', async () => {
      const credentials = {
        username: 'wronguser',
        password: 'secure-password-123',
        totpCode: '123456'
      };

      await expect(AuthService.authenticate(credentials))
        .rejects
        .toThrow('Invalid username or password');
      
      console.log('✅ Incorrect username rejection: PASSED');
    });

    it('should fail with incorrect TOTP code', async () => {
      const credentials = {
        username: 'admin',
        password: 'secure-password-123',
        totpCode: '000000' // This will return false from our mock
      };

      await expect(AuthService.authenticate(credentials))
        .rejects
        .toThrow('Invalid 2FA code');
      
      console.log('✅ Incorrect TOTP rejection: PASSED');
    });
  });

  describe('Password Service Comprehensive Tests', () => {
    const testPasswords = [
      'secure-password-123',
      'MySecureP@ssw0rd!',
      'test123',
      'AVeryLongPasswordThatShouldStillWork2024!@#$',
      'símbolos-especiales-ñañá'
    ];

    testPasswords.forEach((password) => {
      it(`should handle password: "${password.substring(0, 10)}..."`, async () => {
        const hash = await PasswordService.hash(password);
        
        // Verify hash format
        expect(hash).toMatch(/^\$2[aby]\$\d+\$/);
        
        // Verify correct password
        const validResult = await PasswordService.compare(password, hash);
        expect(validResult).toBe(true);
        
        // Verify wrong password
        const invalidResult = await PasswordService.compare(password + 'wrong', hash);
        expect(invalidResult).toBe(false);
        
        console.log(`✅ Password "${password.substring(0, 10)}...": PASSED`);
      });
    });
  });

  describe('Environment Configuration Tests', () => {
    it('should have all required environment variables', () => {
      const requiredVars = [
        'AUTH_USERNAME',
        'AUTH_PASSWORD', 
        'AUTH_2FA_SECRET',
        'JWT_SECRET',
        'JWT_EXPIRES_IN'
      ];

      requiredVars.forEach(varName => {
        expect(process.env[varName]).toBeDefined();
        expect(process.env[varName]).not.toBe('');
        console.log(`✅ Environment variable ${varName}: SET`);
      });
    });

    it('should have proper password hash format', () => {
      const authPassword = process.env.AUTH_PASSWORD!;
      expect(authPassword).toMatch(/^\$2[aby]\$\d+\$/);
      console.log('✅ AUTH_PASSWORD format: VALID');
    });
  });
});