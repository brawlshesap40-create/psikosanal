import { beforeEach, describe, expect, it } from "vitest";
import { testServer } from "./helpers/build";
import { truncateAll } from "./helpers/db";
import { hashRefreshToken, signAccessToken } from "@psikosanal/core";

beforeEach(async () => {
  await truncateAll();
});

const DANISAN = {
  fullName: "Test Danışan",
  email: "test.danisan@example.com",
  phone: "5551234567",
  password: "gecerli-sifre-123",
};

async function register(app: ReturnType<typeof testServer>, overrides: Partial<typeof DANISAN> = {}) {
  return app.inject({
    method: "POST",
    url: "/v1/auth/register/danisan",
    payload: { ...DANISAN, ...overrides },
  });
}

describe("POST /v1/auth/register/danisan", () => {
  it("registers a new danışan and returns a working token pair", async () => {
    const app = testServer();
    const response = await register(app);
    expect(response.statusCode).toBe(201);

    const body = response.json();
    expect(body.user.email).toBe(DANISAN.email);
    expect(typeof body.accessToken).toBe("string");
    expect(typeof body.refreshToken).toBe("string");

    const me = await app.inject({
      method: "GET",
      url: "/v1/auth/me",
      headers: { authorization: `Bearer ${body.accessToken}` },
    });
    expect(me.statusCode).toBe(200);
    expect(me.json().email).toBe(DANISAN.email);
    await app.close();
  });

  it("rejects a duplicate email with 409", async () => {
    const app = testServer();
    await register(app);
    const response = await register(app);
    expect(response.statusCode).toBe(409);
    await app.close();
  });
});

describe("POST /v1/auth/login", () => {
  it("issues a real, working token pair for correct credentials and persists the refresh token", async () => {
    const app = testServer();
    await register(app);

    const response = await app.inject({
      method: "POST",
      url: "/v1/auth/login",
      payload: { email: DANISAN.email, password: DANISAN.password },
    });
    expect(response.statusCode).toBe(200);

    const { accessToken, refreshToken } = response.json();
    expect(typeof accessToken).toBe("string");
    expect(typeof refreshToken).toBe("string");

    // The token pair must be the real, request-signed thing, not stubbed:
    // the access token must pass a protected route, and the refresh token
    // must exist as a hashed row in the DB (login() previously only ever
    // ran through registerDanisan's internal call to it in tests, never
    // exercised on its own via the login route).
    const me = await app.inject({
      method: "GET",
      url: "/v1/auth/me",
      headers: { authorization: `Bearer ${accessToken}` },
    });
    expect(me.statusCode).toBe(200);
    expect(me.json().email).toBe(DANISAN.email);

    const { db } = await import("@psikosanal/db");
    const { refreshTokens } = await import("@psikosanal/db/schema");
    const { eq } = await import("drizzle-orm");
    const stored = await db.query.refreshTokens.findFirst({
      where: eq(refreshTokens.tokenHash, hashRefreshToken(refreshToken)),
    });
    expect(stored).toBeDefined();
    expect(stored?.revokedAt).toBeNull();

    await app.close();
  });

  it("rejects a wrong password and a nonexistent user with the same body shape", async () => {
    const app = testServer();
    await register(app);

    const wrongPassword = await app.inject({
      method: "POST",
      url: "/v1/auth/login",
      payload: { email: DANISAN.email, password: "not-the-right-password" },
    });
    const nonexistentUser = await app.inject({
      method: "POST",
      url: "/v1/auth/login",
      payload: { email: "nobody@example.com", password: "whatever-123" },
    });

    expect(wrongPassword.statusCode).toBe(401);
    expect(nonexistentUser.statusCode).toBe(401);
    expect(wrongPassword.json()).toEqual(nonexistentUser.json());
    await app.close();
  });

  it("rejects login for a disabled account", async () => {
    const app = testServer();
    await register(app);

    const { db } = await import("@psikosanal/db");
    const { users } = await import("@psikosanal/db/schema");
    const { eq } = await import("drizzle-orm");
    await db.update(users).set({ isActive: false }).where(eq(users.email, DANISAN.email));

    const response = await app.inject({
      method: "POST",
      url: "/v1/auth/login",
      payload: { email: DANISAN.email, password: DANISAN.password },
    });
    expect(response.statusCode).toBe(403);
    await app.close();
  });
});

describe("GET /v1/auth/me auth guard", () => {
  it("rejects a missing token", async () => {
    const app = testServer();
    const response = await app.inject({ method: "GET", url: "/v1/auth/me" });
    expect(response.statusCode).toBe(401);
    await app.close();
  });

  it("rejects a malformed token", async () => {
    const app = testServer();
    const response = await app.inject({
      method: "GET",
      url: "/v1/auth/me",
      headers: { authorization: "Bearer not-a-real-token" },
    });
    expect(response.statusCode).toBe(401);
    await app.close();
  });

  it("rejects an expired token", async () => {
    const app = testServer();
    const previousTtl = process.env.ACCESS_TOKEN_TTL;
    process.env.ACCESS_TOKEN_TTL = "1s";
    const token = await signAccessToken({ userId: 1, email: DANISAN.email, role: "danisan" });
    process.env.ACCESS_TOKEN_TTL = previousTtl;

    await new Promise((resolve) => setTimeout(resolve, 1200));

    const response = await app.inject({
      method: "GET",
      url: "/v1/auth/me",
      headers: { authorization: `Bearer ${token}` },
    });
    expect(response.statusCode).toBe(401);
    await app.close();
  }, 5000);
});

describe("POST /v1/auth/refresh", () => {
  it("rotates the refresh token and rejects the old one", async () => {
    const app = testServer();
    const registerResponse = await register(app);
    const { refreshToken } = registerResponse.json();

    const refreshResponse = await app.inject({
      method: "POST",
      url: "/v1/auth/refresh",
      payload: { refreshToken },
    });
    expect(refreshResponse.statusCode).toBe(200);
    const { refreshToken: newRefreshToken } = refreshResponse.json();
    expect(newRefreshToken).not.toEqual(refreshToken);

    const reuseOldToken = await app.inject({
      method: "POST",
      url: "/v1/auth/refresh",
      payload: { refreshToken },
    });
    expect(reuseOldToken.statusCode).toBe(401);
    await app.close();
  });

  it("detects reuse of a rotated token and revokes the whole family", async () => {
    const app = testServer();
    const registerResponse = await register(app);
    const { refreshToken: original } = registerResponse.json();

    const firstRefresh = await app.inject({
      method: "POST",
      url: "/v1/auth/refresh",
      payload: { refreshToken: original },
    });
    const { refreshToken: rotated } = firstRefresh.json();

    // Replay the already-rotated (now revoked) original token.
    const reuse = await app.inject({
      method: "POST",
      url: "/v1/auth/refresh",
      payload: { refreshToken: original },
    });
    expect(reuse.statusCode).toBe(401);

    // The legitimately-issued replacement must now be revoked too.
    const legitimateFollowUp = await app.inject({
      method: "POST",
      url: "/v1/auth/refresh",
      payload: { refreshToken: rotated },
    });
    expect(legitimateFollowUp.statusCode).toBe(401);
    await app.close();
  });
});

describe("POST /v1/auth/logout", () => {
  it("invalidates the refresh token", async () => {
    const app = testServer();
    const registerResponse = await register(app);
    const { accessToken, refreshToken } = registerResponse.json();

    const logoutResponse = await app.inject({
      method: "POST",
      url: "/v1/auth/logout",
      headers: { authorization: `Bearer ${accessToken}` },
      payload: { refreshToken },
    });
    expect(logoutResponse.statusCode).toBe(204);

    const refreshAfterLogout = await app.inject({
      method: "POST",
      url: "/v1/auth/refresh",
      payload: { refreshToken },
    });
    expect(refreshAfterLogout.statusCode).toBe(401);
    await app.close();
  });
});
