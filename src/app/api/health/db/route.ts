import { NextRequest, NextResponse } from 'next/server';
import { testDatabaseConnection } from '@/lib/db/init';

/**
 * @swagger
 * /api/health/db:
 *   get:
 *     summary: Database health check
 *     description: Tests database connection, read/write operations, and returns connection statistics
 *     tags:
 *       - Health
 *     responses:
 *       200:
 *         description: Database health check results
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
 *                     connected:
 *                       type: boolean
 *                       example: true
 *                     duration:
 *                       type: number
 *                       example: 45
 *                     healthRecords:
 *                       type: number
 *                       example: 12
 *                     testRecordId:
 *                       type: string
 *                       example: "507f1f77bcf86cd799439011"
 *                     timestamp:
 *                       type: string
 *                       example: "2024-01-15T10:30:00.000Z"
 *       500:
 *         description: Database connection failed
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
 *                   example: "Database connection failed"
 */

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Testing database connection...');
    
    const result = await testDatabaseConnection();
    
    if (result.success) {
      console.log(`✅ Database health check passed in ${result.duration}ms`);
      
      return NextResponse.json({
        success: true,
        message: 'Database is healthy',
        data: {
          connected: true,
          duration: result.duration,
          healthRecords: result.healthRecords,
          testRecordId: result.testRecordId,
          timestamp: result.timestamp
        }
      });
    } else {
      console.error(`❌ Database health check failed: ${result.error}`);
      
      return NextResponse.json(
        {
          success: false,
          error: 'Database connection failed',
          message: result.error,
          data: {
            connected: false,
            duration: result.duration,
            timestamp: result.timestamp
          }
        },
        { status: 500 }
      );
    }
    
  } catch (error) {
    console.error('❌ Database health check error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Database health check failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

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