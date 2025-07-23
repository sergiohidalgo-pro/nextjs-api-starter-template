import { AuthService } from '@/services/authService';
import { PasswordService } from '@/lib/auth/password';
import { TOTPService } from '@/lib/auth/totp';
import { JWTService } from '@/lib/auth/jwt';
import { env } from '@/lib/config/env';

// Mock the dependencies
jest.mock('@/lib/auth/password');
jest.mock('@/lib/auth/totp');
jest.mock('@/lib/auth/jwt');

describe('AuthService', () => {
  const mockCredentials = {
    username: 'testuser',
    password: 'password123',
    totpCode: '123456',
  };

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    
    // Mock environment variables
    (env as any).AUTH_USERNAME = 'testuser';
    (env as any).AUTH_PASSWORD = 'hashedpassword';
  });

  describe('authenticateUser', () => {
    it('should return tokens on successful authentication', async () => {
      (PasswordService.compare as jest.Mock).mockResolvedValue(true);
      (TOTPService.verifyToken as jest.Mock).mockReturnValue(true);
      (JWTService.generateTokenPair as jest.Mock).mockReturnValue({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });

      const result = await AuthService.authenticateUser(mockCredentials);

      expect(result).toHaveProperty('accessToken', 'access-token');
      expect(result).toHaveProperty('refreshToken', 'refresh-token');
      expect(PasswordService.compare).toHaveBeenCalledWith('password123', 'hashedpassword');
      expect(TOTPService.verifyToken).toHaveBeenCalledWith('123456');
      expect(JWTService.generateTokenPair).toHaveBeenCalledWith('testuser');
    });

    it('should throw an error for invalid password', async () => {
      (PasswordService.compare as jest.Mock).mockResolvedValue(false);
      
      await expect(AuthService.authenticateUser(mockCredentials)).rejects.toThrow('Invalid username or password');
    });

    it('should throw an error for invalid TOTP code', async () => {
      (PasswordService.compare as jest.Mock).mockResolvedValue(true);
      (TOTPService.verifyToken as jest.Mock).mockReturnValue(false);
      
      await expect(AuthService.authenticateUser(mockCredentials)).rejects.toThrow('Invalid 2FA code');
    });
  });

  describe('changePassword', () => {
    const changePasswordRequest = {
      username: 'testuser',
      currentPassword: 'password123',
      newPassword: 'new-password-456',
      totpCode: '123456',
    };

    it('should successfully change the password', async () => {
      (PasswordService.compare as jest.Mock).mockResolvedValue(true);
      (TOTPService.verifyToken as jest.Mock).mockReturnValue(true);
      (PasswordService.hash as jest.Mock).mockResolvedValue('new-hashed-password');

      await AuthService.changePassword(changePasswordRequest);

      expect(PasswordService.compare).toHaveBeenCalledWith('password123', 'hashedpassword');
      expect(TOTPService.verifyToken).toHaveBeenCalledWith('123456');
      expect(PasswordService.hash).toHaveBeenCalledWith('new-password-456');
      expect(env.AUTH_PASSWORD).toBe('new-hashed-password');
    });

    it('should throw an error if required fields are missing', async () => {
      const incompleteRequest = { username: 'testuser' };
      await expect(AuthService.changePassword(incompleteRequest as any)).rejects.toThrow('Missing required fields for password change');
    });
  });
});