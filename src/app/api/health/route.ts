import { ApiResponseUtil } from '@/lib/utils/apiResponse';
import type { HealthCheckResponse } from '@/lib/types/api';
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
 */
export async function GET() {
  try {
    const healthData: HealthCheckResponse = {
      status: 'healthy',
      timestamp: Date.now(),
      uptime: process.uptime(),
      version: packageJson.version,
      environment: process.env.NODE_ENV || 'development',
    };

    return ApiResponseUtil.success(healthData, 'API is running healthy');
  } catch (error) {
    console.error('Health check failed:', error);
    return ApiResponseUtil.internalError('Health check failed');
  }
}