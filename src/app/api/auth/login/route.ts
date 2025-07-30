import { NextRequest } from 'next/server';
import { ApiResponseUtil } from '@/lib/utils/apiResponse';
import { authRequestSchema } from '@/lib/validators/auth';
import { AuthService } from '@/services/authService';
import { handleRateLimiting } from '@/lib/utils/rateLimiter';
import { getClientIp } from '@/lib/utils/getClientIp';
import { createResponseTimeTracker, addResponseTimeHeaders } from '@/lib/utils/responseTime';

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Authenticate user with username, password and 2FA
 *     description: Validates user credentials and a TOTP code, then returns a set of JWT tokens (access and refresh).
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AuthRequest'
 *     responses:
 *       '200':
 *         description: Authentication successful.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       '400':
 *         description: Bad Request - Invalid input data.
 *       '401':
 *         description: Unauthorized - Invalid credentials or 2FA code.
 *       '429':
 *         description: Too Many Requests - Rate limit exceeded.
 */
export async function POST(request: NextRequest) {
  const timer = createResponseTimeTracker();
  const clientIp = getClientIp(request);

  try {
    handleRateLimiting(clientIp);

    // Validate request body
    const body = await request.json();
    const validationResult = authRequestSchema.safeParse(body);
    if (!validationResult.success) {
      return ApiResponseUtil.error(validationResult.error.format(), 400);
    }
    
    // Delegate to the authentication service
    const authResponse = await AuthService.authenticateUser(validationResult.data);
    
    const responseTime = timer.getElapsed();
    const headers = addResponseTimeHeaders({}, responseTime);
    return ApiResponseUtil.success(authResponse, 'Authentication successful', headers);

  } catch (error: any) {
    const responseTime = timer.getElapsed();
    const headers = addResponseTimeHeaders({}, responseTime);
    
    // Centralized error handling
    if (error.message.includes('Rate limit exceeded')) {
      return ApiResponseUtil.error({ message: error.message }, 429, headers);
    }
    if (error.message.includes('Invalid')) { // Catches "Invalid username or password" and "Invalid 2FA code"
      return ApiResponseUtil.unauthorized(error.message, headers);
    }
    
    console.error(`[Login Error] IP: ${clientIp}, Error: ${error.message}`);
    return ApiResponseUtil.internalError('An unexpected error occurred during login.', headers);
  }
}