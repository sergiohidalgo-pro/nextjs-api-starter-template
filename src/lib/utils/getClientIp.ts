import { NextRequest } from 'next/server';

/**
 * Extract client IP address from Next.js request
 * Handles various proxy headers and fallbacks
 */
export function getClientIp(request: NextRequest): string {
  // Check common proxy headers (in order of preference)
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    // x-forwarded-for can contain multiple IPs, take the first one
    return forwardedFor.split(',')[0].trim();
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }

  const cfConnectingIp = request.headers.get('cf-connecting-ip');
  if (cfConnectingIp) {
    return cfConnectingIp.trim();
  }

  const xClientIp = request.headers.get('x-client-ip');
  if (xClientIp) {
    return xClientIp.trim();
  }

  // Ultimate fallback - use localhost for development
  return process.env.NODE_ENV === 'development' ? '127.0.0.1' : 'unknown';
}