#!/usr/bin/env node

const readline = require('readline');
const bcrypt = require('bcryptjs');
const speakeasy = require('speakeasy');

// Import Prisma client
const { PrismaClient } = require('../src/generated/prisma');
const prisma = new PrismaClient();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

function questionPassword(prompt) {
  return new Promise((resolve) => {
    process.stdout.write(prompt);
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    
    let password = '';
    
    process.stdin.on('data', function(char) {
      char = char + '';
      
      switch(char) {
        case '\n':
        case '\r':
        case '\u0004':
          process.stdin.setRawMode(false);
          process.stdin.pause();
          process.stdout.write('\n');
          resolve(password);
          break;
        case '\u0003':
          process.stdout.write('\n');
          process.exit();
          break;
        case '\u007f': // backspace
          if (password.length > 0) {
            password = password.slice(0, -1);
            process.stdout.write('\b \b');
          }
          break;
        default:
          password += char;
          process.stdout.write('*');
          break;
      }
    });
  });
}

async function changePassword() {
  try {
    console.log('🔐 Password Change Tool');
    console.log('=====================\n');
    
    // Connect to database
    await prisma.$connect();
    console.log('✅ Connected to database\n');
    
    // Get username
    const username = await question('👤 Username: ');
    
    // Find user
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
      console.log('❌ User not found');
      process.exit(1);
    }
    
    // Get current password
    const currentPassword = await questionPassword('🔑 Current password: ');
    
    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      console.log('❌ Invalid current password');
      process.exit(1);
    }
    
    // Get 2FA code
    const totpCode = await question('📱 2FA Code (6 digits): ');
    
    // Verify 2FA
    const totpValid = speakeasy.totp.verify({
      secret: user.totpSecret,
      encoding: 'base32',
      token: totpCode,
      window: 2
    });
    
    if (!totpValid) {
      console.log('❌ Invalid 2FA code');
      process.exit(1);
    }
    
    // Get new password
    const newPassword = await questionPassword('🆕 New password: ');
    const confirmPassword = await questionPassword('🔄 Confirm new password: ');
    
    if (newPassword !== confirmPassword) {
      console.log('❌ Passwords do not match');
      process.exit(1);
    }
    
    if (newPassword.length < 8) {
      console.log('❌ Password must be at least 8 characters long');
      process.exit(1);
    }
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    
    // Update password in database
    await prisma.user.update({
      where: { id: user.id },
      data: { 
        password: hashedPassword,
        updatedAt: new Date()
      }
    });
    
    console.log('\n✅ Password updated successfully!');
    console.log('🔄 You can now login with your new password\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    rl.close();
  }
}

// Handle Ctrl+C gracefully
process.on('SIGINT', async () => {
  console.log('\n👋 Goodbye!');
  await prisma.$disconnect();
  process.exit(0);
});

changePassword();