import { NextRequest, NextResponse } from 'next/server';
import { JWTService } from '@/lib/auth/jwt';
import { getClientIp } from '@/lib/utils/getClientIp';
import { rateLimiter } from '@/lib/utils/rateLimiter';

/**
 * @swagger
 * /api/demo/math:
 *   get:
 *     summary: Simple math demo endpoint
 *     description: A demo endpoint that performs simple math operations (1+1=2) with JWT authentication and rate limiting
 *     tags:
 *       - Demo
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
 *       - in: query
 *         name: operation
 *         required: false
 *         schema:
 *           type: string
 *           enum: [add, subtract, multiply, divide]
 *           default: add
 *           example: "add"
 *         description: Math operation to perform (default is addition)
 *       - in: query
 *         name: a
 *         required: false
 *         schema:
 *           type: number
 *           default: 1
 *           example: 1
 *         description: First number (default is 1)
 *       - in: query
 *         name: b
 *         required: false
 *         schema:
 *           type: number
 *           default: 1
 *           example: 1
 *         description: Second number (default is 1)
 *     responses:
 *       200:
 *         description: Math operation completed successfully
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
 *                   example: "Math operation completed successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     operation:
 *                       type: string
 *                       example: "add"
 *                     operandA:
 *                       type: number
 *                       example: 1
 *                     operandB:
 *                       type: number
 *                       example: 1
 *                     result:
 *                       type: number
 *                       example: 2
 *                     expression:
 *                       type: string
 *                       example: "1 + 1 = 2"
 *                     clientIp:
 *                       type: string
 *                       example: "192.168.1.1"
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
 *       400:
 *         description: Bad Request - Invalid parameters
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
 *                   example: "Invalid parameters"
 *                 message:
 *                   type: string
 *                   example: "Division by zero is not allowed"
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
 *                   example: "An error occurred while processing the math operation"
 */

export async function GET(request: NextRequest) {
  // Get client IP
  const clientIp = getClientIp(request);
  
  try {
    
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
    try {
      JWTService.verifyAccessToken(token);
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

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const operation = searchParams.get('operation') || 'add';
    const a = parseFloat(searchParams.get('a') || '1');
    const b = parseFloat(searchParams.get('b') || '1');

    // Validate numbers
    if (isNaN(a) || isNaN(b)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid parameters',
          message: 'Parameters a and b must be valid numbers'
        },
        { status: 400 }
      );
    }

    // Perform math operation
    let result: number;
    let symbol: string;

    switch (operation) {
      case 'add':
        result = a + b;
        symbol = '+';
        break;
      case 'subtract':
        result = a - b;
        symbol = '-';
        break;
      case 'multiply':
        result = a * b;
        symbol = '*';
        break;
      case 'divide':
        if (b === 0) {
          return NextResponse.json(
            {
              success: false,
              error: 'Invalid parameters',
              message: 'Division by zero is not allowed'
            },
            { status: 400 }
          );
        }
        result = a / b;
        symbol = '/';
        break;
      default:
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid operation',
            message: 'Operation must be one of: add, subtract, multiply, divide'
          },
          { status: 400 }
        );
    }

    // Return successful result
    return NextResponse.json(
      {
        success: true,
        message: 'Math operation completed successfully',
        data: {
          operation,
          operandA: a,
          operandB: b,
          result,
          expression: `${a} ${symbol} ${b} = ${result}`,
          clientIp: clientIp,
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
    console.error('Math operation failed from IP:', clientIp);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: 'An error occurred while processing the math operation'
      },
      { status: 500 }
    );
  }
}

// Only allow GET requests - return 405 for other methods
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