import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';

// Force load environment variables always to ensure they're available
dotenv.config({ path: path.join(process.cwd(), '.env') });
dotenv.config({ path: path.join(process.cwd(), '.env.local') }); // Fallback for existing setups

const envSchema = z.object({
  JWT_SECRET: z.string().min(1, 'JWT_SECRET is required and cannot be empty'),
  JWT_EXPIRES_IN: z.string().default('15m'),
  AUTH_USERNAME: z.string().min(1, 'AUTH_USERNAME is required'),
  AUTH_PASSWORD: z.string().min(1, 'AUTH_PASSWORD is required'),
  AUTH_2FA_SECRET: z.string().min(1, 'AUTH_2FA_SECRET is required and cannot be empty'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3000').transform(val => parseInt(val, 10)).pipe(z.number().positive()),
  MONGODB_URI: z.string().default('mongodb://localhost:27017/nextjs-api'),
  API_BASE_URL: z.string().default('http://localhost:3000'),
  RATE_LIMIT_MAX_REQUESTS: z.string().default('5').transform(val => parseInt(val, 10)).pipe(z.number().positive()),
});

export type EnvConfig = z.infer<typeof envSchema>;

function validateEnv(): EnvConfig {
  const parsed = envSchema.safeParse(process.env);
  
  if (!parsed.success) {
    console.error('❌ Invalid environment variables:', JSON.stringify(parsed.error.format(), null, 2));
    throw new Error('Invalid environment variables. Please check your .env file.');
  }
  
  return parsed.data;
}

export const env = validateEnv();