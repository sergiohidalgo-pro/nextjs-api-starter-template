import { z } from 'zod';

export const authRequestSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
  totpCode: z.string().regex(/^\d{6}$/, 'TOTP code must be a 6-digit number'),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters long'),
  totpCode: z.string().regex(/^\d{6}$/, 'TOTP code must be a 6-digit number'),
});

export type AuthRequestData = z.infer<typeof authRequestSchema>;