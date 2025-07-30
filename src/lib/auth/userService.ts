import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db/prisma';
import speakeasy from 'speakeasy';

export class UserService {
  static async createUser(username: string, password: string, totpSecret?: string) {
    // Check if password is already hashed (bcrypt hashes start with $2a$, $2b$, or $2y$)
    const isBcryptHash = /^\$2[aby]\$/.test(password);
    const hashedPassword = isBcryptHash ? password : await bcrypt.hash(password, 12);
    
    const secret = totpSecret || speakeasy.generateSecret({
      name: `${username}@nextjs-api-starter`,
      issuer: 'Next.js API Starter'
    }).base32;

    return await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        totpSecret: secret,
        metadata: {
          createdBy: 'system',
          initialSetup: true,
          passwordPreHashed: isBcryptHash
        }
      }
    });
  }

  static async findByUsername(username: string) {
    return await prisma.user.findUnique({
      where: { username }
    });
  }

  static async validatePassword(plainPassword: string, hashedPassword: string) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  static async updatePassword(userId: string, newPassword: string) {
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    
    return await prisma.user.update({
      where: { id: userId },
      data: { 
        password: hashedPassword,
        updatedAt: new Date()
      }
    });
  }

  static async updateLastLogin(userId: string) {
    return await prisma.user.update({
      where: { id: userId },
      data: { lastLogin: new Date() }
    });
  }

  static async getUserCount() {
    return await prisma.user.count();
  }

  static generateRandomPassword(length: number = 16): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  static async initializeDefaultUser() {
    try {
      const userCount = await this.getUserCount();
      
      if (userCount === 0) {
        // Use environment variables for default credentials
        const username = process.env.AUTH_USERNAME || 'admin';
        const password = process.env.AUTH_PASSWORD || 'admin123';
        const totpSecret = process.env.AUTH_2FA_SECRET || speakeasy.generateSecret({
          name: `${username}@nextjs-api-starter`,
          issuer: 'Next.js API Starter'
        }).base32;

        const user = await this.createUser(username, password, totpSecret);
        
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
    }
  }
}