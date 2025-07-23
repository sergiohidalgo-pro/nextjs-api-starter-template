import { NextRequest, NextResponse } from 'next/server';
import { JWTService } from '@/lib/auth/jwt';
import { getClientIp } from '@/lib/utils/getClientIp';
import { rateLimiter } from '@/lib/utils/rateLimiter';

/**
 * @swagger
 * /api/validate-token:
 *   get:
 *     summary: Validate JWT token
 *     description: Validates a JWT token and returns token information with rate limiting by IP address
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         required: true
 *         schema:
 *           type: string
 *           example: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *         description: JWT token in Bearer format
 *     responses:
 *       200:
 *         description: Token is valid
 *         headers:
 *           X-RateLimit-Limit:
 *             description: Rate limit maximum requests
 *             schema:
 *               type: integer
 *           X-RateLimit-Remaining:
 *             description: Remaining requests in current window
 *             schema:
 *               type: integer
 *           X-RateLimit-Reset:
 *             description: Reset time as Unix timestamp
 *             schema:
 *               type: integer
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Token is valid"
 *                 data:
 *                   type: object
 *                   properties:
 *                     tokenValid:
 *                       type: boolean
 *                       example: true
 *                     clientIp:
 *                       type: string
 *                       example: "192.168.1.1"
 *                     tokenPayload:
 *                       type: object
 *                       properties:
 *                         username:
 *                           type: string
 *                           example: "admin"
 *                         exp:
 *                           type: number
 *                           example: 1234567890
 *                         iat:
 *                           type: number
 *                           example: 1234564290
 *                     rateLimit:
 *                       type: object
 *                       properties:
 *                         remaining:
 *                           type: number
 *                           example: 4
 *                         resetTime:
 *                           type: string
 *                           format: date-time
 *                           example: "2024-01-01T12:00:00.000Z"
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Invalid token"
 *                 message:
 *                   type: string
 *                   example: "The provided JWT token is invalid or expired"
 *                 data:
 *                   type: object
 *                   properties:
 *                     clientIp:
 *                       type: string
 *                       example: "192.168.1.1"
 *                     remaining:
 *                       type: number
 *                       example: 4
 *       429:
 *         description: Too Many Requests - Rate limit exceeded
 *         headers:
 *           X-RateLimit-Limit:
 *             description: Rate limit maximum requests
 *             schema:
 *               type: integer
 *           X-RateLimit-Remaining:
 *             description: Remaining requests (0 when rate limited)
 *             schema:
 *               type: integer
 *           X-RateLimit-Reset:
 *             description: Reset time as Unix timestamp
 *             schema:
 *               type: integer
 *           Retry-After:
 *             description: Seconds to wait before retrying
 *             schema:
 *               type: integer
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Rate limit exceeded"
 *                 message:
 *                   type: string
 *                   example: "Too many requests. Try again after 2024-01-01T13:00:00.000Z"
 *                 data:
 *                   type: object
 *                   properties:
 *                     rateLimited:
 *                       type: boolean
 *                       example: true
 *                     remaining:
 *                       type: number
 *                       example: 0
 *                     resetTime:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-01-01T13:00:00.000Z"
 *                     clientIp:
 *                       type: string
 *                       example: "192.168.1.1"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Internal server error"
 *                 message:
 *                   type: string
 *                   example: "An error occurred while validating the token"
 */

export async function GET(request: NextRequest) {
  try {
    // Get client IP
    const clientIp = getClientIp(request);
    
    // Check rate limit
    const rateLimitResult = rateLimiter.checkRateLimit(clientIp);
    
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: 'Rate limit exceeded',
          message: `Too many requests. Try again after ${rateLimitResult.resetTime.toISOString()}`,
          data: {
            rateLimited: true,
            remaining: rateLimitResult.remaining,
            resetTime: rateLimitResult.resetTime.toISOString(),
            clientIp: clientIp
          }
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': '5',
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': Math.ceil(rateLimitResult.resetTime.getTime() / 1000).toString(),
            'Retry-After': Math.ceil((rateLimitResult.resetTime.getTime() - Date.now()) / 1000).toString()
          }
        }
      );
    }

    // Extract token from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing or invalid authorization header',
          message: 'Authorization header must be in format: Bearer <token>',
          data: {
            clientIp: clientIp,
            remaining: rateLimitResult.remaining
          }
        },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Validate JWT access token
    let decoded;
    try {
      decoded = JWTService.verifyAccessToken(token);
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid token',
          message: 'The provided JWT token is invalid or expired',
          data: {
            clientIp: clientIp,
            remaining: rateLimitResult.remaining
          }
        },
        { status: 401 }
      );
    }

    // Token is valid
    return NextResponse.json(
      {
        success: true,
        message: 'Token is valid',
        data: {
          tokenValid: true,
          clientIp: clientIp,
          tokenPayload: {
            username: decoded.username,
            exp: decoded.exp,
            iat: decoded.iat
          },
          rateLimit: {
            remaining: rateLimitResult.remaining,
            resetTime: rateLimitResult.resetTime.toISOString()
          }
        }
      },
      {
        headers: {
          'X-RateLimit-Limit': '5',
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
          'X-RateLimit-Reset': Math.ceil(rateLimitResult.resetTime.getTime() / 1000).toString()
        }
      }
    );

  } catch {
    // Secure logging - don't log sensitive information
    const clientIp = getClientIp(request);
    console.error('Token validation failed from IP:', clientIp);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: 'An error occurred while validating the token'
      },
      { status: 500 }
    );
  }
}

// Only allow GET requests
export async function POST() {
  return NextResponse.json(
    {
      success: false,
      error: 'Method not allowed',
      message: 'This endpoint only accepts GET requests'
    },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    {
      success: false,
      error: 'Method not allowed',
      message: 'This endpoint only accepts GET requests'
    },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    {
      success: false,
      error: 'Method not allowed',
      message: 'This endpoint only accepts GET requests'
    },
    { status: 405 }
  );
}