import dotenv from 'dotenv';
import path from "path";

dotenv.config({ path: path.join(process.cwd(), '.env') });

// Simple environment configuration - rely on Next.js env loading
export const env = {
  JWT_SECRET: process.env.JWT_SECRET || '',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1h',
  AUTH_USERNAME: process.env.AUTH_USERNAME || '',
  AUTH_PASSWORD: process.env.AUTH_PASSWORD || '',
  AUTH_2FA_SECRET: process.env.AUTH_2FA_SECRET || '',
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '3000', 10),
};

// Basic validation with better error messages
if (!env.JWT_SECRET) {
  console.error('Missing JWT_SECRET environment variable');
  throw new Error('JWT_SECRET is required');
}
if (!env.AUTH_USERNAME) {
  console.error('Missing AUTH_USERNAME environment variable');
  throw new Error('AUTH_USERNAME is required');
}
if (!env.AUTH_PASSWORD) {
  console.error('Missing AUTH_PASSWORD environment variable');
  throw new Error('AUTH_PASSWORD is required');
}
if (!env.AUTH_2FA_SECRET) {
  console.error('Missing AUTH_2FA_SECRET environment variable');
  throw new Error('AUTH_2FA_SECRET is required');
}

export type EnvConfig = typeof env;
