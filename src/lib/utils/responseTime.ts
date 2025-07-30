/**
 * Response Time Utilities
 * Provides timing functionality for API endpoints
 */

export interface ResponseTimeTracker {
  startTime: number;
  getElapsed(): number;
  getElapsedFormatted(): string;
}

/**
 * Creates a response time tracker that measures execution time in milliseconds
 * @returns ResponseTimeTracker instance
 */
export function createResponseTimeTracker(): ResponseTimeTracker {
  const startTime = performance.now();
  
  return {
    startTime,
    
    /**
     * Get elapsed time in milliseconds
     * @returns elapsed time in milliseconds (float)
     */
    getElapsed(): number {
      return performance.now() - startTime;
    },
    
    /**
     * Get elapsed time formatted for user display (in seconds with appropriate precision)
     * @returns formatted time string
     */
    getElapsedFormatted(): string {
      const elapsed = this.getElapsed();
      
      if (elapsed < 1000) {
        return `${elapsed.toFixed(0)}ms`;
      } else if (elapsed < 10000) {
        return `${(elapsed / 1000).toFixed(2)}s`;
      } else {
        return `${(elapsed / 1000).toFixed(1)}s`;
      }
    }
  };
}

/**
 * Format milliseconds for user display
 * @param ms time in milliseconds
 * @returns formatted time string
 */
export function formatResponseTime(ms: number): string {
  if (ms < 1000) {
    return `${ms.toFixed(0)}ms`;
  } else if (ms < 10000) {
    return `${(ms / 1000).toFixed(2)}s`;
  } else {
    return `${(ms / 1000).toFixed(1)}s`;
  }
}

/**
 * Add response time headers to a response
 * @param headers existing headers object
 * @param responseTime time in milliseconds
 * @returns headers with timing information
 */
export function addResponseTimeHeaders(headers: Record<string, string>, responseTime: number): Record<string, string> {
  return {
    ...headers,
    'X-Response-Time': `${responseTime.toFixed(2)}ms`,
    'X-Response-Time-Formatted': formatResponseTime(responseTime)
  };
}