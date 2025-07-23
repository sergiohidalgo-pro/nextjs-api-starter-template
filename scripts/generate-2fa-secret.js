#!/usr/bin/env node

/**
 * Generate 2FA Secret Script
 * Usage: node scripts/generate-2fa-secret.js "My Project"
 */

const speakeasy = require('speakeasy');
const qrcode = require('qrcode');

function generate2FASecret() {
  const projectName = process.argv[2] || 'AuthDemo';
  const user = 'admin'; // Or any identifier

  console.log('🔐 Generating secure 2FA/TOTP secret...');

  // Generate a secret object. Speakeasy automatically creates it in base32.
  const secret = speakeasy.generateSecret({
    name: `${projectName} (${user})`,
    length: 20, // 160 bits, a common length
  });

  console.log('\n✅ 2FA secret generated successfully!');
  console.log('\n🔑 Secret to use in your .env file:');
  console.log(`AUTH_2FA_SECRET=${secret.base32}`);

  console.log('\n📱 To set up in your authenticator app (e.g., Google Authenticator, 1Password):');
  console.log('You can either scan the QR code below or enter the key manually.');
  
  console.log('\n--- Manual Setup ---');
  console.log(`Account Name: ${projectName} (${user})`);
  console.log(`Your Key: ${secret.base32}`);
  console.log('Type: Time-based (TOTP)');
  
  console.log('\n--- QR Code ---');
  console.log('Scan the QR code below with your app:');
  
  // Generate and display the QR code in the terminal
  qrcode.toString(secret.otpauth_url, { type: 'terminal' }, (err, url) => {
    if (err) {
      console.error('Error generating QR code:', err);
      return;
    }
    console.log(url);
    console.log('If the QR code does not render correctly, you can copy this URL into your browser:');
    console.log(secret.otpauth_url);
  });
}

generate2FASecret();