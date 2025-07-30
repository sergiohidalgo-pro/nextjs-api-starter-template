import { ApiResponseUtil } from '@/lib/utils/apiResponse';
import type { HealthCheckResponse } from '@/lib/types/api';
import { testDatabaseConnection } from '@/lib/db/init';
import { createResponseTimeTracker, addResponseTimeHeaders } from '@/lib/utils/responseTime';
import packageJson from '../../../../package.json';

/**
 * @swagger
 * /api/health:
 *   get:
 *     tags:
 *       - Health
 *     summary: Health check endpoint
 *     description: Returns the current health status of the API
 *     responses:
 *       200:
 *         description: API is healthy
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
 *                     status:
 *                       type: string
 *                       example: healthy
 *                     timestamp:
 *                       type: number
 *                       description: Unix timestamp in milliseconds
 *                     uptime:
 *                       type: number
 *                       description: Server uptime in seconds
 *                     version:
 *                       type: string
 *                       example: 0.1.0
 *                     database:
 *                       type: object
 *                       properties:
 *                         connected:
 *                           type: boolean
 *                           example: true
 *                         responseTime:
 *                           type: number
 *                           example: 45
 *                     responseTime:
 *                       type: number
 *                       description: API response time in milliseconds
 *                       example: 125.45
 */
export async function GET() {
  const timer = createResponseTimeTracker();
  
  try {
    // Test database connection
    const dbTest = await testDatabaseConnection();
    
    const responseTime = timer.getElapsed();
    
    const healthData: HealthCheckResponse = {
      status: dbTest.success ? 'healthy' : 'degraded',
      timestamp: Date.now(),
      uptime: process.uptime(),
      version: packageJson.version,
      environment: process.env.NODE_ENV || 'development',
      database: {
        connected: dbTest.success,
        responseTime: dbTest.duration
      },
      responseTime: Math.round(responseTime * 100) / 100 // Round to 2 decimal places
    };

    const headers = addResponseTimeHeaders({}, responseTime);
    return ApiResponseUtil.success(healthData, 'API health check completed', headers);
  } catch (error) {
    const responseTime = timer.getElapsed();
    const headers = addResponseTimeHeaders({}, responseTime);
    console.error('Health check failed:', error);
    return ApiResponseUtil.internalError('Health check failed', headers);
  }
}