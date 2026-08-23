import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { SignJWT } from "jose";
import {
  generateRefreshToken,
  hashRefreshToken,
  signAccessToken,
  verifyAccessToken,
} from "./tokens";

const ORIGINAL_ENV = { ...process.env };

beforeEach(() => {
  process.env.API_JWT_SECRET = "test-secret-do-not-use-in-production-32b";
  process.env.ACCESS_TOKEN_TTL = "15m";
});

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
  vi.useRealTimers();
});

const session = { userId: 42, email: "test@example.com", role: "danisan" as const };

describe("access tokens", () => {
  it("round-trips a signed token", async () => {
    const token = await signAccessToken(session);
    const result = await verifyAccessToken(token);
    expect(result).toEqual(session);
  });

  it("rejects an expired token", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
    const token = await signAccessToken(session);
    vi.setSystemTime(new Date("2026-01-01T00:20:00Z"));
    const result = await verifyAccessToken(token);
    expect(result).toBeNull();
  });

  it("rejects a token signed with a different secret", async () => {
    const token = await signAccessToken(session);
    process.env.API_JWT_SECRET = "a-completely-different-secret-value-here";
    const result = await verifyAccessToken(token);
    expect(result).toBeNull();
  });

  it("rejects a tampered payload", async () => {
    const token = await signAccessToken(session);
    const [header, , signature] = token.split(".");
    const tamperedPayload = Buffer.from(
      JSON.stringify({ sub: "1", email: "attacker@example.com", role: "admin", typ: "access" })
    ).toString("base64url");
    const result = await verifyAccessToken(`${header}.${tamperedPayload}.${signature}`);
    expect(result).toBeNull();
  });

  it("rejects a token with the web session's claim shape (no iss/aud) even under the same secret", async () => {
    const secret = new TextEncoder().encode(process.env.API_JWT_SECRET);
    const webStyleToken = await new SignJWT({
      userId: session.userId,
      email: session.email,
      role: session.role,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(secret);

    const result = await verifyAccessToken(webStyleToken);
    expect(result).toBeNull();
  });
});

describe("refresh tokens", () => {
  it("generates distinct opaque tokens", () => {
    const a = generateRefreshToken();
    const b = generateRefreshToken();
    expect(a).not.toEqual(b);
    expect(a.length).toBeGreaterThan(20);
  });

  it("hashes deterministically and never returns the plaintext", () => {
    const token = generateRefreshToken();
    const hash1 = hashRefreshToken(token);
    const hash2 = hashRefreshToken(token);
    expect(hash1).toEqual(hash2);
    expect(hash1).not.toEqual(token);
  });
});
