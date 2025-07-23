import { TOTPService } from '@/lib/auth/totp';

// Mock speakeasy for controlled testing
jest.mock('speakeasy', () => ({
  totp: {
    verify: jest.fn()
  }
}));

import speakeasy from 'speakeasy';
const mockSpeakeasy = speakeasy as jest.Mocked<typeof speakeasy>;

describe('TOTPService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ACID: Atomic - Token verification gives definitive result
  describe('verifyToken', () => {
    it('should return true for valid TOTP code', () => {
      mockSpeakeasy.totp.verify.mockReturnValue(true);
      
      const result = TOTPService.verifyToken('123456');
      
      expect(result).toBe(true);
      expect(mockSpeakeasy.totp.verify).toHaveBeenCalledWith({
        secret: process.env.AUTH_2FA_SECRET,
        encoding: 'base32',
        token: '123456',
        window: 1
      });
    });

    // ACID: Consistent - Invalid tokens always return false
    it('should return false for invalid TOTP code', () => {
      mockSpeakeasy.totp.verify.mockReturnValue(false);
      
      const result = TOTPService.verifyToken('000000');
      
      expect(result).toBe(false);
      expect(mockSpeakeasy.totp.verify).toHaveBeenCalledWith({
        secret: process.env.AUTH_2FA_SECRET,
        encoding: 'base32',
        token: '000000',
        window: 1
      });
    });

    // ACID: Isolated - Verification doesn't affect system state
    it('should handle empty token', () => {
      mockSpeakeasy.totp.verify.mockReturnValue(false);
      
      const result = TOTPService.verifyToken('');
      
      expect(result).toBe(false);
      expect(mockSpeakeasy.totp.verify).toHaveBeenCalledWith({
        secret: process.env.AUTH_2FA_SECRET,
        encoding: 'base32',
        token: '',
        window: 1
      });
    });

    it('should handle null/undefined token gracefully', () => {
      mockSpeakeasy.totp.verify.mockReturnValue(false);
      
      const resultNull = TOTPService.verifyToken(null as unknown as string);
      const resultUndefined = TOTPService.verifyToken(undefined as unknown as string);
      
      expect(resultNull).toBe(false);
      expect(resultUndefined).toBe(false);
    });

    // ACID: Durability - Verification parameters are consistent
    it('should always use correct verification parameters', () => {
      mockSpeakeasy.totp.verify.mockReturnValue(true);
      
      TOTPService.verifyToken('123456');
      
      expect(mockSpeakeasy.totp.verify).toHaveBeenCalledWith({
        secret: process.env.AUTH_2FA_SECRET,
        encoding: 'base32',
        token: '123456',
        window: 1
      });
    });

    // Test various token formats
    it('should handle different token formats', () => {
      const testCases = [
        '123456',
        '000000',
        '999999',
        '123',     // Too short
        '1234567', // Too long
        'abcdef',  // Non-numeric
        ' 123456 ' // With spaces
      ];

      testCases.forEach(token => {
        mockSpeakeasy.totp.verify.mockReturnValue(false);
        
        const result = TOTPService.verifyToken(token);
        
        expect(result).toBe(false);
        expect(mockSpeakeasy.totp.verify).toHaveBeenCalledWith({
          secret: process.env.AUTH_2FA_SECRET,
          encoding: 'base32',
          token: token,
          window: 1
        });
      });
    });

    // ACID: Consistent - Multiple calls with same token give same result
    it('should be consistent across multiple calls', () => {
      mockSpeakeasy.totp.verify.mockReturnValue(true);
      
      const token = '123456';
      const results = [
        TOTPService.verifyToken(token),
        TOTPService.verifyToken(token),
        TOTPService.verifyToken(token)
      ];
      
      expect(results).toEqual([true, true, true]);
      expect(mockSpeakeasy.totp.verify).toHaveBeenCalledTimes(3);
    });

    // Error handling
    it('should handle speakeasy errors gracefully', () => {
      mockSpeakeasy.totp.verify.mockImplementation(() => {
        throw new Error('Speakeasy error');
      });
      
      expect(() => {
        TOTPService.verifyToken('123456');
      }).toThrow('Speakeasy error');
    });

    // Performance test
    it('should verify tokens quickly', () => {
      mockSpeakeasy.totp.verify.mockReturnValue(true);
      
      const startTime = Date.now();
      
      // Verify multiple tokens
      for (let i = 0; i < 100; i++) {
        TOTPService.verifyToken('123456');
      }
      
      const endTime = Date.now();
      expect(endTime - startTime).toBeLessThan(50); // Should complete in under 50ms
    });
  });

  // Integration-style tests with mocked speakeasy
  describe('integration scenarios', () => {
    it('should handle time window verification correctly', () => {
      // Test that window parameter is used correctly
      mockSpeakeasy.totp.verify.mockReturnValue(true);
      
      TOTPService.verifyToken('123456');
      
      const callArgs = mockSpeakeasy.totp.verify.mock.calls[0][0];
      expect(callArgs.window).toBe(1); // Should allow 1 time step tolerance
    });

    it('should use base32 encoding consistently', () => {
      mockSpeakeasy.totp.verify.mockReturnValue(true);
      
      TOTPService.verifyToken('654321');
      
      const callArgs = mockSpeakeasy.totp.verify.mock.calls[0][0];
      expect(callArgs.encoding).toBe('base32');
    });

    it('should use environment secret correctly', () => {
      mockSpeakeasy.totp.verify.mockReturnValue(true);
      
      TOTPService.verifyToken('111111');
      
      const callArgs = mockSpeakeasy.totp.verify.mock.calls[0][0];
      expect(callArgs.secret).toBe(process.env.AUTH_2FA_SECRET);
    });
  });
});