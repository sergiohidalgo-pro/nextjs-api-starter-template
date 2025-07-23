import { PasswordService } from '@/lib/auth/password';

describe('PasswordService', () => {
  const testPassword = 'testPassword123!';
  
  // ACID: Atomic - Hash operation is complete or fails entirely
  describe('hash', () => {
    it('should generate a bcrypt hash', async () => {
      const hash = await PasswordService.hash(testPassword);
      
      expect(typeof hash).toBe('string');
      expect(hash).toMatch(/^\$2b\$12\$/); // bcrypt format with 12 salt rounds
      expect(hash).not.toBe(testPassword);
      expect(hash.length).toBeGreaterThan(50);
    });

    // ACID: Consistent - Same password produces different hashes (salt)
    it('should generate different hashes for same password', async () => {
      const hash1 = await PasswordService.hash(testPassword);
      const hash2 = await PasswordService.hash(testPassword);
      
      expect(hash1).not.toBe(hash2);
      expect(hash1).toMatch(/^\$2b\$12\$/);
      expect(hash2).toMatch(/^\$2b\$12\$/);
    });

    // ACID: Isolated - Hash generation doesn't affect other operations
    it('should handle empty password', async () => {
      const hash = await PasswordService.hash('');
      
      expect(typeof hash).toBe('string');
      expect(hash).toMatch(/^\$2b\$12\$/);
    });

    // ACID: Durability - Hash operation is deterministic in format
    it('should handle special characters', async () => {
      const specialPassword = 'pǎssw0rd!@#$%^&*()_+-=[]{}|;:,.<>?`~';
      const hash = await PasswordService.hash(specialPassword);
      
      expect(hash).toMatch(/^\$2b\$12\$/);
      expect(typeof hash).toBe('string');
    });
  });

  // ACID: Atomic - Compare operation gives definitive result
  describe('compare', () => {
    let validHash: string;
    
    beforeAll(async () => {
      validHash = await PasswordService.hash(testPassword);
    });

    it('should return true for correct password', async () => {
      const result = await PasswordService.compare(testPassword, validHash);
      expect(result).toBe(true);
    });

    // ACID: Consistent - Wrong password always returns false
    it('should return false for incorrect password', async () => {
      const result = await PasswordService.compare('wrongPassword', validHash);
      expect(result).toBe(false);
    });

    it('should return false for empty password against valid hash', async () => {
      const result = await PasswordService.compare('', validHash);
      expect(result).toBe(false);
    });

    it('should return false for password against empty hash', async () => {
      const result = await PasswordService.compare(testPassword, '');
      expect(result).toBe(false);
    });

    // ACID: Isolated - Invalid hash format doesn't crash the system
    it('should handle invalid hash format gracefully', async () => {
      const result = await PasswordService.compare(testPassword, 'invalid-hash');
      expect(result).toBe(false);
    });

    // ACID: Durability - Comparison is consistent across calls
    it('should be consistent across multiple calls', async () => {
      const results = await Promise.all([
        PasswordService.compare(testPassword, validHash),
        PasswordService.compare(testPassword, validHash),
        PasswordService.compare(testPassword, validHash)
      ]);
      
      expect(results).toEqual([true, true, true]);
    });

    it('should handle special characters in comparison', async () => {
      const specialPassword = 'pǎssw0rd!@#$%^&*()_+-=[]{}|;:,.<>?`~';
      const specialHash = await PasswordService.hash(specialPassword);
      
      const correctResult = await PasswordService.compare(specialPassword, specialHash);
      const incorrectResult = await PasswordService.compare('wrong', specialHash);
      
      expect(correctResult).toBe(true);
      expect(incorrectResult).toBe(false);
    });
  });

  // Integration test - Full hash and compare cycle
  describe('hash and compare integration', () => {
    it('should work together correctly', async () => {
      const passwords = [
        'simple',
        'Complex123!',
        'with spaces and symbols !@#$',
        '中文密码123',
        '🔐🔑💻'
      ];

      for (const password of passwords) {
        const hash = await PasswordService.hash(password);
        const isValid = await PasswordService.compare(password, hash);
        const isInvalid = await PasswordService.compare('wrong', hash);
        
        expect(isValid).toBe(true);
        expect(isInvalid).toBe(false);
      }
    });

    // Performance test
    it('should handle reasonable load', async () => {
      const startTime = Date.now();
      
      const operations = Array(5).fill(null).map(async (_, index) => {
        const password = `testPassword${index}`;
        const hash = await PasswordService.hash(password);
        return PasswordService.compare(password, hash);
      });
      
      const results = await Promise.all(operations);
      const endTime = Date.now();
      
      expect(results).toEqual([true, true, true, true, true]);
      expect(endTime - startTime).toBeLessThan(5000); // Should complete in under 5 seconds
    });
  });
});