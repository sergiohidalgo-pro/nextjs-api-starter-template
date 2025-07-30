export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface HealthCheckResponse {
  status: 'healthy' | 'degraded';
  timestamp: number;
  uptime: number;
  version: string;
  environment: string;
  responseTime: number;
  database?: {
    connected: boolean;
    responseTime: number;
  };
}

export interface AuthRequest {
  username: string;
  password: string;
  totpCode: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
  tokenType: 'Bearer';
}

export interface ChangePasswordRequest {
  username: string;
  currentPassword?: string;
  newPassword?: string;
  totpCode?: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface JWTPayload {
  username: string;
  type: 'access' | 'refresh';
  iat: number;
  exp: number;
}