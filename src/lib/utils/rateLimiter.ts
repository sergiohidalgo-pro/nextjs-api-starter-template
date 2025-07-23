/*
 * Rate Limiter Utility
 * --------------------
 * Diseñado para ser un limitador de peticiones en memoria (sin dependencias externas).
 * Se exponen varias instancias con configuraciones diferentes para reutilización
 * en distintos endpoints (general, login, refresh token, etc.).
 *
 * ¡Advertencia!  Esto **no** es apto para producción en entornos distribuidos;
 * se incluye únicamente con fines demostrativos y de test.
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: Date;
}

function createRateLimiter(maxRequests: number, windowMs: number) {
  const store = new Map<string, RateLimitEntry>();

  return {
    /**
     * Comprueba y actualiza las estadísticas de peticiones para el identificador (por ejemplo, IP).
     */
    checkRateLimit(identifier: string): RateLimitResult {
      const now = Date.now();
      let entry = store.get(identifier);

      // Reiniciar ventana si ha expirado
      if (!entry || entry.resetTime < now) {
        entry = { count: 0, resetTime: now + windowMs };
        store.set(identifier, entry);
      }

      // Incrementar y evaluar
      entry.count += 1;
      const allowed = entry.count <= maxRequests;

      // remaining nunca será negativo
      const remaining = allowed ? maxRequests - entry.count : 0;

      return {
        allowed,
        remaining,
        resetTime: new Date(entry.resetTime),
      };
    },

    /**
     * Limpia toda la información almacenada (útil en tests E2E).
     */
    clear() {
      store.clear();
    },
  } as const;
}

// Configuraciones por defecto
const GENERAL_MAX_REQUESTS = 5;
const GENERAL_WINDOW_MS = 10_000; // 10 s

const LOGIN_MAX_REQUESTS = 5;
const LOGIN_WINDOW_MS = 60_000; // 1 min

const REFRESH_MAX_REQUESTS = 5;
const REFRESH_WINDOW_MS = 60_000; // 1 min

// Instancias reutilizables
export const rateLimiter = createRateLimiter(GENERAL_MAX_REQUESTS, GENERAL_WINDOW_MS);
export const loginRateLimiter = createRateLimiter(LOGIN_MAX_REQUESTS, LOGIN_WINDOW_MS);
export const refreshTokenRateLimiter = createRateLimiter(REFRESH_MAX_REQUESTS, REFRESH_WINDOW_MS);

/**
 * Adaptador legacy para rutas que lanzan excepción en vez de devolver objeto.
 * Se emplea en /api/auth/login.
 */
export function handleRateLimiting(identifier: string) {
  const result = loginRateLimiter.checkRateLimit(identifier);

  if (!result.allowed) {
    throw new Error('Rate limit exceeded');
  }
} 