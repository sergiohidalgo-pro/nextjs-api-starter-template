// Global test setup
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only';
process.env.JWT_EXPIRES_IN = '1h';
process.env.AUTH_USERNAME = 'testuser';
process.env.AUTH_PASSWORD = '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3tXhBuLpW.'; // 'testpass123'
process.env.AUTH_2FA_SECRET = 'JBSWY3DPEHPK3PXP';
process.env.PORT = '3000';
process.env.RATE_LIMIT_MAX_REQUESTS = '5';