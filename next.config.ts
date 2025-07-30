import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
    AUTH_USERNAME: process.env.AUTH_USERNAME,
    AUTH_PASSWORD: process.env.AUTH_PASSWORD,
    AUTH_2FA_SECRET: process.env.AUTH_2FA_SECRET,
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: process.env.NODE_ENV === 'development' 
              ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'; object-src 'none';"
              : "script-src 'self' 'unsafe-inline'; object-src 'none';",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
