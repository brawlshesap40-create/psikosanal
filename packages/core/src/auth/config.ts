// Lazy on purpose: this module must be importable (e.g. from apps/web,
// which has no API_JWT_SECRET) without throwing. Values are only read —
// and only then can throw — when a token function actually needs them.

function readEnv(name: string, fallback?: string) {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {
    throw new Error(`${name} ortam değişkeni tanımlı değil`);
  }
  return value;
}

export function getApiJwtSecret() {
  return new TextEncoder().encode(readEnv("API_JWT_SECRET"));
}

export function getAccessTokenTtl() {
  return readEnv("ACCESS_TOKEN_TTL", "15m");
}

export function getRefreshTokenTtlDays() {
  return Number(readEnv("REFRESH_TOKEN_TTL_DAYS", "30"));
}

export const TOKEN_ISSUER = "psikosanal-api";
export const TOKEN_AUDIENCE = "psikosanal-app";
