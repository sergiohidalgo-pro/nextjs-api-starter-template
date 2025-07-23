import { NextRequest } from 'next/server';
import { ApiResponseUtil } from '@/lib/utils/apiResponse';
import { JWTService } from '@/lib/auth/jwt';
import { refreshTokenRateLimiter } from '@/lib/utils/rateLimiter';
import { getClientIp } from '@/lib/utils/getClientIp';
import type { AuthResponse } from '@/lib/types/api';

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Refresh access token using refresh token
 *     description: Exchange a valid refresh token for a new access token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: Valid refresh token
 *                 example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     accessToken:
 *                       type: string
 *                       description: New JWT access token
 *                     refreshToken:
 *                       type: string
 *                       description: New refresh token
 *                     expiresIn:
 *                       type: string
 *                       description: Access token expiration time
 *                       example: '15m'
 *                     tokenType:
 *                       type: string
 *                       example: 'Bearer'
 *                 message:
 *                   type: string
 *                   example: 'Token refreshed successfully'
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Invalid or expired refresh token
 *       429:
 *         description: Too many requests
 */
export async function POST(request: NextRequest) {
  // Get client IP for rate limiting
  const clientIp = getClientIp(request);
  
  try {
    
    // Apply refresh token rate limiting
    const rateLimitResult = refreshTokenRateLimiter.checkRateLimit(clientIp);
    
    if (!rateLimitResult.allowed) {
      return ApiResponseUtil.error(
        `Too many refresh attempts. Try again after ${rateLimitResult.resetTime.toISOString()}`,
        429
      );
    }

    const body = await request.json();
    
    // Validate request data
    if (!body.refreshToken || typeof body.refreshToken !== 'string') {
      return ApiResponseUtil.error('Refresh token is required');
    }

    // Verify refresh token
    let payload;
    try {
      payload = JWTService.verifyRefreshToken(body.refreshToken);
    } catch {
      return ApiResponseUtil.unauthorized('Invalid or expired refresh token');
    }

    // Generate new token pair
    const { accessToken, refreshToken } = JWTService.generateTokenPair(payload.username);

    const authResponse: AuthResponse = {
      accessToken,
      refreshToken,
      expiresIn: '15m',
      tokenType: 'Bearer' as const,
    };
    
    return ApiResponseUtil.success(authResponse, 'Token refreshed successfully');
  } catch (error) {
    // Secure logging - don't log sensitive information
    console.error('Token refresh failed from IP:', clientIp);
    
    if (error instanceof Error) {
      return ApiResponseUtil.unauthorized(error.message);
    }
    
    return ApiResponseUtil.internalError('Token refresh failed');
  }
}

// Only allow POST requests
export async function GET() {
  return ApiResponseUtil.error('Method not allowed', 405);
}

export async function PUT() {
  return ApiResponseUtil.error('Method not allowed', 405);
}

export async function DELETE() {
  return ApiResponseUtil.error('Method not allowed', 405);
}