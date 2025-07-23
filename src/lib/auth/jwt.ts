import jwt from 'jsonwebtoken';
import { env } from '@/lib/config/env';
import type { JWTPayload } from '@/lib/types/api';

export class JWTService {
  static generateAccessToken(username: string): string {
    const payload = {
      username,
      type: 'access',
    };
    
    return jwt.sign(payload, env.JWT_SECRET, { expiresIn: '15m' }); // Short-lived access token
  }

  static generateRefreshToken(username: string): string {
    const payload = {
      username,
      type: 'refresh',
    };
    
    return jwt.sign(payload, env.JWT_SECRET, { expiresIn: '7d' }); // Long-lived refresh token
  }

  static generateTokenPair(username: string): { accessToken: string; refreshToken: string } {
    return {
      accessToken: this.generateAccessToken(username),
      refreshToken: this.generateRefreshToken(username),
    };
  }

  static verifyToken(token: string): JWTPayload {
    try {
      return jwt.verify(token, env.JWT_SECRET) as JWTPayload;
    } catch {
      throw new Error('Invalid or expired token');
    }
  }

  static verifyAccessToken(token: string): JWTPayload {
    const payload = this.verifyToken(token);
    if (payload.type !== 'access') {
      throw new Error('Invalid token type');
    }
    return payload;
  }

  static verifyRefreshToken(token: string): JWTPayload {
    const payload = this.verifyToken(token);
    if (payload.type !== 'refresh') {
      throw new Error('Invalid token type');
    }
    return payload;
  }

  static extractTokenFromHeader(authHeader: string | null): string {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('Invalid authorization header');
    }
    
    return authHeader.substring(7);
  }
}