import { env } from '@/lib/config/env';
import { Buffer } from 'buffer';
import { JWTService } from '@/lib/auth/jwt';
import { TOTPService } from '@/lib/auth/totp';
import { PasswordService } from '@/lib/auth/password';
import type { AuthRequest, AuthResponse, ChangePasswordRequest } from '@/lib/types/api';
import type { EnvConfig } from '@/lib/config/env';

// Helper interno para lanzar errores en función del entorno
function buildAuthError(devMessage: string, prodMessage: string = 'Invalid username or password'): Error {
  return new Error(env.NODE_ENV === 'development' ? devMessage : prodMessage);
}

export class AuthService {
  /**
   * Verifies the user's username and password.
   * A private helper function to ensure atomicity in authentication checks.
   * @param username - The user's username.
   * @param password - The user's password.
   * @throws An error if credentials are invalid.
   */
  private static async _verifyUserCredentials(username: string, password?: string): Promise<void> {
    if (username !== env.AUTH_USERNAME) {
      console.debug('[AuthService] Username mismatch', { provided: username, expected: env.AUTH_USERNAME });
      throw buildAuthError('Invalid username');
    }

    if (!password) {
      console.debug('[AuthService] Password not provided');
      throw buildAuthError('Password not provided');
    }

    // El valor del .env puede venir con comillas o espacios sobrantes si se copia/pega
    const envPassword = env.AUTH_PASSWORD.trim().replace(/^['\"]|['\"]$/g, '');

    let isValid = false;

    try {
      // Se limpian comillas o espacios accidentales en la contraseña recibida
      const cleanPassword = password.trim().replace(/^['\"]|['\"]$/g, '');

      // Preparamos variantes de la contraseña a probar
      const passwordBase64 = Buffer.from(cleanPassword, 'utf8').toString('base64');

      if (env.NODE_ENV === 'development') {
        console.debug('[AuthService] Comparing passwords', { cleanPassword, passwordBase64, envPasswordStart: envPassword.slice(0,10) });
      }

      // 1. Si AUTH_PASSWORD empieza con "$2" es un hash bcrypt directo
      if (envPassword.startsWith('$2')) {
        // Intentamos comparar contra la contraseña original y contra su versión Base64
        const compareOriginal = await PasswordService.compare(cleanPassword, envPassword);
        const compareBase64 = await PasswordService.compare(passwordBase64, envPassword);
        isValid = compareOriginal || compareBase64;
        
        if (env.NODE_ENV === 'development') {
          console.debug('[AuthService] Comparison results', { compareOriginal, compareBase64, isValid });
        }
      } else {
        // 2. Intentar decodificar ENV (podría ser hash bcrypt codificado en Base64)
        let decoded = '';
        try {
          decoded = Buffer.from(envPassword, 'base64').toString('utf8');
        } catch {
          // No era Base64 válido
        }

        if (decoded && decoded.startsWith('$2')) {
          // Hash se encontraba codificado en Base64
          const compareOriginalDecoded = await PasswordService.compare(cleanPassword, decoded);
          const compareBase64Decoded = await PasswordService.compare(passwordBase64, decoded);
          isValid = compareOriginalDecoded || compareBase64Decoded;
        } else {
          // 3. Fallback a texto plano (útil en desarrollo): aceptamos coincidencia directa o vía Base64
          isValid = cleanPassword === envPassword || passwordBase64 === envPassword;
        }
      }
    } catch {
      // Cualquier error en la comparación lo trataremos como credenciales inválidas
      isValid = false;
    }

    if (!isValid) {
      console.debug('[AuthService] Password verification failed');
      throw buildAuthError('Invalid password');
    }
  }

  /**
   * Verifies the user's TOTP code.
   * @param totpCode - The 6-digit code from the authenticator app.
   * @throws An error if the TOTP code is invalid.
   */
  private static _verifyTotpCode(totpCode: string): void {
    const verified = TOTPService.verifyToken(totpCode);
    if (!verified) {
      console.debug('[AuthService] Invalid 2FA code', { totpCode });
      const msg = env.NODE_ENV === 'development' ? 'Invalid 2FA code' : 'Invalid 2FA code';
      throw new Error(msg);
    }
  }

  /**
   * Authenticates a user and returns JWT tokens.
   * This function composes credential and TOTP verification.
   * @param credentials - The user's authentication request data.
   * @returns A promise that resolves to an authentication response.
   */
  static async authenticateUser(credentials: AuthRequest): Promise<AuthResponse> {
    const { username, password, totpCode } = credentials;

    await this._verifyUserCredentials(username, password);
    this._verifyTotpCode(totpCode);

    const { accessToken, refreshToken } = JWTService.generateTokenPair(username);

    return {
      accessToken,
      refreshToken,
      expiresIn: env.JWT_EXPIRES_IN,
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

    // Validate that all required fields are present
    if (!currentPassword || !newPassword || !totpCode) {
      throw new Error('Missing required fields for password change');
    }

    await this._verifyUserCredentials(username, currentPassword);
    this._verifyTotpCode(totpCode);

    const hashedNewPassword = await PasswordService.hash(newPassword);

    // This is a critical step in a stateless, env-based setup.
    // It updates the password for the current runtime instance.
    // In a production environment, this should trigger a more robust secret update mechanism.
    (env as EnvConfig).AUTH_PASSWORD = hashedNewPassword;
    
    console.log('🔑 New password hash:', hashedNewPassword);
    console.warn('ACTION REQUIRED: Update AUTH_PASSWORD in your .env file and restart the application in production.');
  }
}