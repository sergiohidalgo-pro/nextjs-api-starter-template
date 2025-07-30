#!/usr/bin/env node

const { PrismaClient } = require('../src/generated/prisma');
const bcrypt = require('bcryptjs');
const speakeasy = require('speakeasy');
require('dotenv').config();

const prisma = new PrismaClient();

async function initializeDefaultUser() {
  try {
    console.log('🔄 Checking for existing users...');
    
    const userCount = await prisma.user.count();
    
    if (userCount === 0) {
      // Use environment variables for default credentials
      const username = process.env.AUTH_USERNAME || 'admin';
      const password = process.env.AUTH_PASSWORD || 'admin123';
      const totpSecret = process.env.AUTH_2FA_SECRET || speakeasy.generateSecret({
        name: `${username}@nextjs-api-starter`,
        issuer: 'Next.js API Starter'
      }).base32;

      // Check if password is already hashed (bcrypt hashes start with $2a$, $2b$, or $2y$)
      const isBcryptHash = /^\$2[aby]\$/.test(password);
      const hashedPassword = isBcryptHash ? password : await bcrypt.hash(password, 12);

      const user = await prisma.user.create({
        data: {
          username,
          password: hashedPassword,
          totpSecret: totpSecret,
          metadata: {
            createdBy: 'system',
            initialSetup: true,
            passwordPreHashed: isBcryptHash
          }
        }
      });
      
      console.log('🚀 ===== INITIAL SETUP COMPLETED =====');
      console.log('👤 Default user created successfully!');
      console.log('');
      console.log('📋 LOGIN CREDENTIALS:');
      console.log(`   Username: ${username}`);
      console.log(`   Password: ${password}`);
      console.log(`   2FA Secret: ${totpSecret}`);
      console.log('');
      console.log('🔐 Credentials loaded from environment variables');
      console.log('📝 Add the 2FA secret to your authenticator app');
      console.log('');
      console.log('=====================================');
      
      return { user, password, totpSecret };
    }
    
    console.log(`✅ Database already has ${userCount} user(s), skipping default user creation`);
    return null;
  } catch (error) {
    console.error('❌ Failed to initialize default user:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

initializeDefaultUser().catch(console.error);