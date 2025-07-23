import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Create response
  const response = NextResponse.next();

  // Enhanced security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
  
  // Add HSTS header for production HTTPS
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }

  // Enhanced CSP based on route type
  if (request.nextUrl.pathname.startsWith('/api/')) {
    // Strict CSP for API routes
    response.headers.set(
      'Content-Security-Policy',
      "default-src 'none'; frame-ancestors 'none'; base-uri 'none';"
    );
  } else if (request.nextUrl.pathname.startsWith('/docs')) {
    // Allow Swagger UI resources
    response.headers.set(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-ancestors 'none';"
    );
  } else {
    // Default CSP for other routes
    response.headers.set(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self';"
    );
  }

  // Add API versioning and remove server information
  response.headers.set('API-Version', '1.0.0');
  response.headers.delete('Server');
  response.headers.delete('X-Powered-By');

  // Add rate limiting headers hint
  if (request.nextUrl.pathname.startsWith('/api/')) {
    response.headers.set('X-RateLimit-Policy', 'IP-based rate limiting active');
  }

  return response;
}

export const config = {
  // Apply middleware to all routes
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};