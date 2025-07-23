#!/usr/bin/env node

const { z } = require('zod');
const dotenv = require('dotenv');
const path = require('path');

// Mimic the exact env loading from the app
const envPath = path.resolve(process.cwd(), '.env');
dotenv.config({ path: envPath });

const envSchema = z.object({
  JWT_SECRET: z.string().min(1, 'JWT_SECRET is required and cannot be empty'),
  JWT_EXPIRES_IN: z.string().default('15m'),
  AUTH_USERNAME: z.string().min(1, 'AUTH_USERNAME is required'),
  AUTH_PASSWORD: z.string().min(1, 'AUTH_PASSWORD is required'),
  AUTH_2FA_SECRET: z.string().min(1, 'AUTH_2FA_SECRET is required and cannot be empty'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3000').transform(val => parseInt(val, 10)).pipe(z.number().positive()),
});

function validateEnv() {
  const parsed = envSchema.safeParse(process.env);
  
  if (!parsed.success) {
    console.error('❌ Invalid environment variables:', parsed.error.format());
    throw new Error('Invalid environment variables. Please check your .env file.');
  }
  
  return parsed.data;
}

try {
  const env = validateEnv();
  console.log('Raw process.env.AUTH_PASSWORD:', process.env.AUTH_PASSWORD);
  console.log('Validated env.AUTH_PASSWORD:', env.AUTH_PASSWORD);
  console.log('First 4 chars of validated:', env.AUTH_PASSWORD.slice(0,4));
} catch (error) {
  console.error('Environment validation failed:', error.message);
}