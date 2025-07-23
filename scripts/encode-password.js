#!/usr/bin/env node

/**
 * Password Hash Encoder Script
 * Encodes bcrypt hash to Base64 to avoid shell variable expansion issues
 * Usage: node scripts/encode-password.js [password]
 */

const bcrypt = require('bcryptjs');

async function encodePassword() {
  const password = process.argv[2];
  
  if (!password) {
    console.error('❌ Error: Please provide a password');
    console.log('Usage: node scripts/encode-password.js <password>');
    console.log('Example: node scripts/encode-password.js mySecurePassword123!');
    process.exit(1);
  }

  if (password.length < 8) {
    console.error('❌ Error: Password must be at least 8 characters long');
    process.exit(1);
  }

  try {
    console.log('🔐 Generating secure password hash...');
    const hash = await bcrypt.hash(password, 12);
    
    // Encode to Base64 to avoid shell variable expansion
    const encodedHash = Buffer.from(hash).toString('base64');
    
    console.log('\n✅ Password hash generated and encoded successfully!');
    console.log('🔑 Raw hash:', hash);
    console.log('🔑 Encoded hash to use in .env:');
    console.log(`AUTH_PASSWORD_ENCODED=${encodedHash}`);
    console.log('\n📝 Instructions:');
    console.log('1. Update your .env file with the encoded hash above');
    console.log('2. The system will automatically decode it at runtime');
    console.log('3. Never commit the plain text password');
    
  } catch (error) {
    console.error('❌ Error generating hash:', error.message);
    process.exit(1);
  }
}

encodePassword();