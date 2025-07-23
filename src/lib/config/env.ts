import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';

// --- Let Next.js handle environment loading ---
// Next.js automatically loads .env files, so we don't need to force load them
// Only use dotenv for non-Next.js environments

const envSchema = z.object({
  JWT_SECRET: z.string().min(1, 'JWT_SECRET is required and cannot be empty'),
  JWT_EXPIRES_IN: z.string().default('15m'),
  AUTH_USERNAME: z.string().min(1, 'AUTH_USERNAME is required'),
  AUTH_PASSWORD: z.string().min(1, 'AUTH_PASSWORD is required'),
  AUTH_2FA_SECRET: z.string().min(1, 'AUTH_2FA_SECRET is required and cannot be empty'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3000').transform(val => parseInt(val, 10)).pipe(z.number().positive()),
});

export type EnvConfig = z.infer<typeof envSchema>;

function validateEnv(): EnvConfig {
  const parsed = envSchema.safeParse(process.env);
  
  if (!parsed.success) {
    console.error('❌ Invalid environment variables:', parsed.error.format());
    throw new Error('Invalid environment variables. Please check your .env file.');
  }
  
  return parsed.data;
}

export const env = validateEnv();