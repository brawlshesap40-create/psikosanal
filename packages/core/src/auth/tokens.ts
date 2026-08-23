import { randomBytes, createHash } from "crypto";
import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import {
  getApiJwtSecret,
  getAccessTokenTtl,
  TOKEN_ISSUER,
  TOKEN_AUDIENCE,
} from "./config";
import type { AppSession, UserRole } from "./session-types";

export type AccessTokenPayload = JWTPayload & {
  sub: string;
  email: string;
  role: UserRole;
  typ: "access";
};

export async function signAccessToken(session: AppSession) {
  return new SignJWT({
    email: session.email,
    role: session.role,
    typ: "access",
  } satisfies Omit<AccessTokenPayload, "sub">)
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(session.userId))
    .setIssuer(TOKEN_ISSUER)
    .setAudience(TOKEN_AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(getAccessTokenTtl())
    .sign(getApiJwtSecret());
}

export async function verifyAccessToken(
  token: string
): Promise<AppSession | null> {
  try {
    const { payload } = await jwtVerify(token, getApiJwtSecret(), {
      algorithms: ["HS256"],
      issuer: TOKEN_ISSUER,
      audience: TOKEN_AUDIENCE,
    });
    if (payload.typ !== "access" || !payload.sub) return null;
    return {
      userId: Number(payload.sub),
      email: payload.email as string,
      role: payload.role as UserRole,
    };
  } catch {
    return null;
  }
}

export function generateRefreshToken() {
  return randomBytes(32).toString("base64url");
}

export function hashRefreshToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}
