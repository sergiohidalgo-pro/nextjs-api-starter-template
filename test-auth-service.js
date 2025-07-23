#!/usr/bin/env node

const bcrypt = require('bcryptjs');
const { Buffer } = require('buffer');
const dotenv = require('dotenv');
const path = require('path');

// Load environment exactly like the app does
const envPath = path.resolve(process.cwd(), '.env');
dotenv.config({ path: envPath });

class PasswordService {
  static async compare(password, hashedPassword) {
    return bcrypt.compare(password, hashedPassword);
  }
}

async function testAuthService() {
  const password = '&&&password%%%';
  const envPasswordRaw = process.env.AUTH_PASSWORD;
  
  console.log('Raw AUTH_PASSWORD:', envPasswordRaw);
  
  // Mimic AuthService logic exactly
  const cleanPassword = password.trim().replace(/^['\"]|['\"]$/g, '');
  const passwordBase64 = Buffer.from(cleanPassword, 'utf8').toString('base64');
  const envPassword = envPasswordRaw.trim().replace(/^['\"]|['\"]$/g, '');
  
  console.log('[AuthService] Comparing passwords', { 
    cleanPassword, 
    passwordBase64, 
    hashPrefix: envPassword.slice(0,4) 
  });
  
  let isValid = false;
  
  try {
    if (envPassword.startsWith('$2')) {
      console.log('Taking bcrypt path...');
      const compareOriginal = await PasswordService.compare(cleanPassword, envPassword);
      const compareBase64 = await PasswordService.compare(passwordBase64, envPassword);
      isValid = compareOriginal || compareBase64;
      
      console.log('[AuthService] Comparison results', { 
        compareOriginal, 
        compareBase64, 
        isValid 
      });
    } else {
      console.log('Taking non-bcrypt path...');
      // ... rest of logic
    }
  } catch (error) {
    console.error('Error during comparison:', error);
    isValid = false;
  }
  
  if (!isValid) {
    console.log('[AuthService] Password verification failed');
  } else {
    console.log('[AuthService] Password verification succeeded!');
  }
}

testAuthService().catch(console.error);