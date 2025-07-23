#!/usr/bin/env node

/**
 * Generate JWT Secret Script
 * Usage: node scripts/generate-jwt-secret.js
 */

const crypto = require('crypto');

function generateJWTSecret() {
  console.log('🔐 Generating cryptographically secure JWT secret...');
  
  // Generate 256-bit (32 bytes) random secret
  const secret = crypto.randomBytes(64).toString('hex');
  
  console.log('\n✅ JWT secret generated successfully!');
  console.log('🔑 Secret to use in .env:');
  console.log(`JWT_SECRET=${secret}`);
  
  console.log('\n📝 Security notes:');
  console.log('• This is a 512-bit (64 byte) cryptographically secure secret');
  console.log('• Never commit this secret to version control');
  console.log('• Rotate secrets regularly in production');
  console.log('• Store securely using environment variables or secret managers');
  
  console.log('\n🔄 To generate a new secret, run this script again');
}

generateJWTSecret();