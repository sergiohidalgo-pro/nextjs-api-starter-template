import speakeasy from 'speakeasy';
import { env } from '@/lib/config/env';

export class TOTPService {
  static verifyToken(token: string): boolean {
    return speakeasy.totp.verify({
      secret: env.AUTH_2FA_SECRET,
      encoding: 'base32',
      token,
      window: 1, // Reduced window: ±30 seconds for better security
    });
  }

  static generateSecret(): string {
    const secret = speakeasy.generateSecret({
      name: 'Cl-init-api-nextjs API',
      issuer: 'Cl-init-api-nextjs',
    });
    
    return secret.base32;
  }
}