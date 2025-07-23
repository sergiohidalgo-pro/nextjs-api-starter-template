import { NextRequest } from 'next/server';
import { POST } from '@/app/api/auth/login/route';
import { AuthService } from '@/services/authService';
import { loginRateLimiter } from '@/lib/utils/rateLimiter';

// Mock dependencies for isolation (ACID: Isolated)
jest.mock('@/services/authService');
jest.mock('@/lib/utils/rateLimiter');
jest.mock('@/lib/utils/getClientIp', () => ({
  getClientIp: jest.fn(() => '127.0.0.1')
}));

const mockAuthService = AuthService as jest.Mocked<typeof AuthService>;
const mockRateLimiter = loginRateLimiter as jest.Mocked<typeof loginRateLimiter>;

describe('/api/auth/login', () => {
  // Setup for consistency (ACID: Consistent)
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default successful mocks
    mockRateLimiter.checkRateLimit.mockReturnValue({
      allowed: true,
      remaining: 4,
      resetTime: new Date(Date.now() + 3600000)
    });
    
    mockAuthService.authenticate.mockResolvedValue({
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
      expiresIn: '15m',
      tokenType: 'Bearer'
    });
  });

  const createRequest = (body: Record<string, unknown>): NextRequest => {
    return new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
  };

  // ACID: Atomic - Successful login is complete operation
  it('should authenticate successfully with valid credentials', async () => {
    const validBody = {
      username: 'testuser',
      password: 'testpass123',
      totpCode: '123456'
    };

    const request = createRequest(validBody);
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({
      success: true,
      data: {
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        expiresIn: '15m',
        tokenType: 'Bearer'
      },
      message: 'Authentication successful'
    });

    expect(mockAuthService.authenticate).toHaveBeenCalledWith(validBody);
    expect(mockRateLimiter.checkRateLimit).toHaveBeenCalledWith('127.0.0.1');
  });

  // ACID: Consistent - Rate limiting always blocks when exceeded
  it('should return 429 when rate limit exceeded', async () => {
    const resetTime = new Date(Date.now() + 3600000);
    mockRateLimiter.checkRateLimit.mockReturnValue({
      allowed: false,
      remaining: 0,
      resetTime
    });

    const request = createRequest({
      username: 'testuser',
      password: 'testpass123',
      totpCode: '123456'
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(429);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Rate limit exceeded');
    expect(data.message).toContain('Too many requests');

    // Auth service should not be called when rate limited
    expect(mockAuthService.authenticate).not.toHaveBeenCalled();
  });

  // ACID: Consistent - Invalid input always fails validation
  describe('input validation', () => {
    it('should return 400 for missing username', async () => {
      const invalidBody = {
        password: 'testpass123',
        totpCode: '123456'
      };

      const request = createRequest(invalidBody);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Validation failed');
      expect(mockAuthService.authenticate).not.toHaveBeenCalled();
    });

    it('should return 400 for missing password', async () => {
      const invalidBody = {
        username: 'testuser',
        totpCode: '123456'
      };

      const request = createRequest(invalidBody);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Validation failed');
      expect(mockAuthService.authenticate).not.toHaveBeenCalled();
    });

    it('should return 400 for missing totpCode', async () => {
      const invalidBody = {
        username: 'testuser',
        password: 'testpass123'
      };

      const request = createRequest(invalidBody);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Validation failed');
      expect(mockAuthService.authenticate).not.toHaveBeenCalled();
    });

    it('should return 400 for invalid TOTP format', async () => {
      const invalidBody = {
        username: 'testuser',
        password: 'testpass123',
        totpCode: '12345' // Should be 6 digits
      };

      const request = createRequest(invalidBody);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Validation failed');
      expect(mockAuthService.authenticate).not.toHaveBeenCalled();
    });
  });

  // ACID: Isolated - Authentication errors are handled independently
  describe('authentication errors', () => {
    it('should return 401 for invalid credentials', async () => {
      mockAuthService.authenticate.mockRejectedValue(new Error('Invalid username or password'));

      const request = createRequest({
        username: 'testuser',
        password: 'wrongpass',
        totpCode: '123456'
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Invalid username or password');
      expect(mockAuthService.authenticate).toHaveBeenCalled();
    });

    it('should return 401 for invalid 2FA code', async () => {
      mockAuthService.authenticate.mockRejectedValue(new Error('Invalid 2FA code'));

      const request = createRequest({
        username: 'testuser',
        password: 'testpass123',
        totpCode: '000000'
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Invalid 2FA code');
    });
  });

  // ACID: Durability - Server errors are properly handled
  it('should return 500 for unexpected server errors', async () => {
    mockAuthService.authenticate.mockRejectedValue(new Error('Database connection failed'));

    const request = createRequest({
      username: 'testuser',
      password: 'testpass123',
      totpCode: '123456'
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Authentication failed');
  });

  // Edge case: Malformed JSON
  it('should handle malformed JSON gracefully', async () => {
    const request = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'invalid json'
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Authentication failed');
  });
});