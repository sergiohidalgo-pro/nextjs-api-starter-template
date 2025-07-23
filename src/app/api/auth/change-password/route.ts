import { NextRequest } from 'next/server';
import { ApiResponseUtil } from '@/lib/utils/apiResponse';
import { AuthService } from '@/services/authService';
import { handleRateLimiting } from '@/lib/utils/rateLimiter';
import { getClientIp } from '@/lib/utils/getClientIp';
import { JWTService } from '@/lib/auth/jwt';
import { z } from 'zod';
import { changePasswordSchema } from '@/lib/validators/auth';

/**
 * @swagger
 * /api/auth/change-password:
 *   post:
 *     summary: Change user password
 *     description: Changes the user's password after verifying the current one and a 2FA code. Requires a valid access token.
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChangePasswordRequest'
 *     responses:
 *       '200':
 *         description: Password changed successfully.
 *       '400':
 *         description: Bad Request - Invalid input data.
 *       '401':
 *         description: Unauthorized - Invalid token, credentials, or 2FA code.
 *       '429':
 *         description: Too Many Requests - Rate limit exceeded.
 */
export async function POST(request: NextRequest) {
  const clientIp = getClientIp(request);

  try {
    handleRateLimiting(clientIp);

    const token = JWTService.extractTokenFromHeader(request.headers.get('authorization'));
    const tokenPayload = JWTService.verifyAccessToken(token);

    const body = await request.json();
    const validationResult = changePasswordSchema.safeParse(body);
    if (!validationResult.success) {
      return ApiResponseUtil.error(validationResult.error.format(), 400);
    }

    await AuthService.changePassword({
      username: tokenPayload.username,
      ...validationResult.data,
    });
    
    return ApiResponseUtil.success(null, 'Password changed successfully');
    
  } catch (error: any) {
    if (error.message.includes('Rate limit exceeded')) {
      return ApiResponseUtil.error({ message: error.message }, 429);
    }
    if (error.message.includes('Invalid')) {
      return ApiResponseUtil.unauthorized(error.message);
    }
    
    console.error(`[Change Password Error] IP: ${clientIp}, Error: ${error.message}`);
    return ApiResponseUtil.internalError('An unexpected error occurred.');
  }
}

// Handle unsupported methods
export async function GET() {
  return ApiResponseUtil.methodNotAllowed('This endpoint only accepts POST requests');
}