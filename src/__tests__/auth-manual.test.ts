/**
 * Manual Authentication Test
 * This test directly tests the password hash without relying on cached env module
 */

import bcrypt from 'bcryptjs';

describe('Manual Authentication Test', () => {
  const PASSWORD = 'secure-password-123';
  const HASH_FROM_ENV = '$2b$12$QsKfJqkspO38CEMC79.3wOmQH1EpIvijUXiRbH.D31Fzwrtsnue3m';

  it('should verify the exact hash from .env.local works', async () => {
    console.log('🔍 Testing password hash manually...');
    console.log('Password:', PASSWORD);
    console.log('Hash:', HASH_FROM_ENV);
    
    const result = await bcrypt.compare(PASSWORD, HASH_FROM_ENV);
    console.log('Verification result:', result);
    
    expect(result).toBe(true); // Hash should work correctly
  });

  it('should generate and test a fresh hash', async () => {
    console.log('🔍 Generating fresh hash...');
    
    const freshHash = await bcrypt.hash(PASSWORD, 12);
    console.log('Fresh hash:', freshHash);
    
    const result = await bcrypt.compare(PASSWORD, freshHash);
    console.log('Fresh hash verification:', result);
    
    expect(result).toBe(true);
  });

  it('should show what the correct hash should be', async () => {
    console.log('🔍 Generating correct hash for password:', PASSWORD);
    
    const correctHash = await bcrypt.hash(PASSWORD, 12);
    console.log('✅ Use this hash in .env.local:');
    console.log(`AUTH_PASSWORD=${correctHash}`);
    
    // Verify it works
    const verification = await bcrypt.compare(PASSWORD, correctHash);
    expect(verification).toBe(true);
  });
});