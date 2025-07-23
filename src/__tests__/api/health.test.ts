import { NextRequest } from 'next/server';
import { GET } from '@/app/api/health/route';

describe('/api/health', () => {
  // ACID: Atomic - Health check is a single, complete operation
  it('should return health status successfully', async () => {
    const request = new NextRequest('http://localhost:3000/api/health');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toHaveProperty('status', 'healthy');
    expect(data.data).toHaveProperty('timestamp');
    expect(data.data).toHaveProperty('uptime');
    expect(data.data).toHaveProperty('version');
    expect(data.data).toHaveProperty('environment');
    expect(data.message).toBe('API is running healthy');
  });

  // ACID: Consistent - Health check always returns same structure
  it('should always return consistent response structure', async () => {
    const request = new NextRequest('http://localhost:3000/api/health');
    const response1 = await GET(request);
    const data1 = await response1.json();

    // Wait a small amount of time
    await new Promise(resolve => setTimeout(resolve, 10));

    const response2 = await GET(request);
    const data2 = await response2.json();

    // Structure should be identical
    expect(Object.keys(data1.data).sort()).toEqual(Object.keys(data2.data).sort());
    expect(data1.success).toBe(data2.success);
    expect(data1.message).toBe(data2.message);

    // Values that should change
    expect(data2.data.timestamp).toBeGreaterThan(data1.data.timestamp);
    expect(data2.data.uptime).toBeGreaterThanOrEqual(data1.data.uptime);

    // Values that should remain the same
    expect(data1.data.status).toBe(data2.data.status);
    expect(data1.data.version).toBe(data2.data.version);
    expect(data1.data.environment).toBe(data2.data.environment);
  });

  // ACID: Isolated - Health check doesn't depend on external state
  it('should work independently without authentication', async () => {
    const request = new NextRequest('http://localhost:3000/api/health');
    const response = await GET(request);

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toContain('application/json');
  });

  // ACID: Durability - Health check data types are consistent
  it('should return correct data types', async () => {
    const request = new NextRequest('http://localhost:3000/api/health');
    const response = await GET(request);
    const data = await response.json();

    expect(typeof data.success).toBe('boolean');
    expect(typeof data.message).toBe('string');
    expect(typeof data.data.status).toBe('string');
    expect(typeof data.data.timestamp).toBe('number');
    expect(typeof data.data.uptime).toBe('number');
    expect(typeof data.data.version).toBe('string');
    expect(typeof data.data.environment).toBe('string');
  });

  // Performance test - Health check should be fast
  it('should respond quickly', async () => {
    const startTime = Date.now();
    const request = new NextRequest('http://localhost:3000/api/health');
    const response = await GET(request);
    const endTime = Date.now();

    expect(response.status).toBe(200);
    expect(endTime - startTime).toBeLessThan(100); // Should respond in under 100ms
  });
});