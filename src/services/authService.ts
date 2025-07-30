import { JWTService } from '@/lib/auth/jwt';
import { TOTPService } from '@/lib/auth/totp';
import { UserService } from '@/lib/auth/userService';
import type { AuthRequest, AuthResponse, ChangePasswordRequest } from '@/lib/types/api';
import speakeasy from 'speakeasy';

export class AuthService {
  /**
   * Verifies the user's credentials against the database.
   * @param username - The user's username.
   * @param password - The user's password.
   * @throws An error if credentials are invalid.
   */
  private static async _verifyUserCredentials(username: string, password?: string) {
    if (!password) {
      throw new Error('Password not provided');
    }

    const user = await UserService.findByUsername(username);
    if (!user) {
      throw new Error('Invalid username or password');
    }

    if (!user.isActive) {
      throw new Error('User account is disabled');
    }

    const isValidPassword = await UserService.validatePassword(password, user.password);
    if (!isValidPassword) {
      throw new Error('Invalid username or password');
    }

    return user;
  }

  /**
   * Verifies the user's TOTP code.
   * @param totpCode - The 6-digit code from the authenticator app.
   * @param totpSecret - The user's TOTP secret.
   * @throws An error if the TOTP code is invalid.
   */
  private static _verifyTotpCode(totpCode: string, totpSecret: string): void {
    const verified = speakeasy.totp.verify({
      secret: totpSecret,
      encoding: 'base32',
      token: totpCode,
      window: 2
    });

    if (!verified) {
      throw new Error('Invalid 2FA code');
    }
  }

  /**
   * Authenticates a user and returns JWT tokens.
   * @param credentials - The user's authentication request data.
   * @returns A promise that resolves to an authentication response.
   */
  static async authenticateUser(credentials: AuthRequest): Promise<AuthResponse> {
    const { username, password, totpCode } = credentials;

    const user = await this._verifyUserCredentials(username, password);
    this._verifyTotpCode(totpCode, user.totpSecret);

    // Update last login
    await UserService.updateLastLogin(user.id);

    const { accessToken, refreshToken } = JWTService.generateTokenPair(username);

    return {
      accessToken,
      refreshToken,
      expiresIn: '1h',
      tokenType: 'Bearer' as const,
    };
  }

  /**
   * Changes the user's password after verifying their current credentials and 2FA code.
   * @param request - The password change request data.
   * @throws An error if verification fails or on other processing errors.
   */
  static async changePassword(request: ChangePasswordRequest): Promise<void> {
    const { username, currentPassword, newPassword, totpCode } = request;

    if (!currentPassword || !newPassword || !totpCode) {
      throw new Error('Missing required fields for password change');
    }

    const user = await this._verifyUserCredentials(username, currentPassword);
    this._verifyTotpCode(totpCode, user.totpSecret);

    await UserService.updatePassword(user.id, newPassword);

    console.log('✅ Password updated successfully for user:', username);
  }

  /**
   * Initialize the authentication system - create default user if none exists
   */
  static async initializeAuth() {
    try {
      const result = await UserService.initializeDefaultUser();
      return result;
    } catch (error) {
      console.error('❌ Failed to initialize authentication system:', error);
      throw error;
    }
  }
}