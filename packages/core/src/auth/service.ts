import { randomUUID } from "crypto";
import { and, eq, isNull } from "drizzle-orm";
import { db } from "@psikosanal/db";
import { refreshTokens, users } from "@psikosanal/db/schema";
import { hashPassword, verifyPassword } from "./password";
import { generateRefreshToken, hashRefreshToken, signAccessToken } from "./tokens";
import {
  accountDisabled,
  emailTaken,
  invalidCredentials,
  invalidRefreshToken,
  validationError,
} from "./errors";
import type { AppSession, UserRole } from "./session-types";
import { getRefreshTokenTtlDays } from "./config";

export type TokenPair = { accessToken: string; refreshToken: string };

async function issueRefreshToken(
  userId: number,
  familyId: string,
  meta?: { userAgent?: string; ip?: string }
) {
  const token = generateRefreshToken();
  const expiresAt = new Date(
    Date.now() + getRefreshTokenTtlDays() * 24 * 60 * 60 * 1000
  );

  await db.insert(refreshTokens).values({
    userId,
    tokenHash: hashRefreshToken(token),
    familyId,
    expiresAt,
    userAgent: meta?.userAgent,
    ip: meta?.ip,
  });

  return token;
}

export async function registerDanisan(input: {
  fullName: string;
  email: string;
  phone: string;
  password: string;
}) {
  const email = input.email.toLowerCase();

  const existing = await db.query.users.findFirst({
    where: eq(users.email, email),
  });
  if (existing) throw emailTaken();

  const passwordHash = await hashPassword(input.password);
  const [user] = await db
    .insert(users)
    .values({
      email,
      passwordHash,
      role: "danisan",
      fullName: input.fullName,
      phone: input.phone,
    })
    .returning();

  return user;
}

export async function login(input: {
  email: string;
  password: string;
  allowedRoles?: UserRole[];
  meta?: { userAgent?: string; ip?: string };
  /**
   * Whether to sign an API JWT access/refresh pair. Defaults to true (the
   * Fastify API's use case). The web app only needs credential verification
   * — it manages its own cookie session — and doesn't have API_JWT_SECRET
   * configured, so it passes `issueTokens: false` to skip this entirely.
   */
  issueTokens?: boolean;
}): Promise<{ user: typeof users.$inferSelect; tokens?: TokenPair }> {
  const email = input.email.toLowerCase();

  const user = await db.query.users.findFirst({ where: eq(users.email, email) });
  if (!user) throw invalidCredentials();
  if (input.allowedRoles && !input.allowedRoles.includes(user.role)) {
    throw invalidCredentials();
  }

  const valid = await verifyPassword(input.password, user.passwordHash);
  if (!valid) throw invalidCredentials();
  if (!user.isActive) throw accountDisabled();

  if (input.issueTokens === false) {
    return { user };
  }

  const familyId = randomUUID();
  const accessSession: AppSession = { userId: user.id, email: user.email, role: user.role };
  const accessToken = await signAccessToken(accessSession);
  const refreshToken = await issueRefreshToken(user.id, familyId, input.meta);

  return { user, tokens: { accessToken, refreshToken } };
}

export async function refresh(
  presentedToken: string,
  meta?: { userAgent?: string; ip?: string }
): Promise<TokenPair> {
  const presentedHash = hashRefreshToken(presentedToken);

  // Throwing inside db.transaction() rolls back everything written in it —
  // including the reuse-detection revoke below, which must survive even
  // though this whole request ultimately fails. So every branch here
  // returns a discriminated result instead of throwing, and the actual
  // DomainError is thrown only after the transaction has committed.
  const result = await db.transaction(async (tx) => {
    const existing = await tx.query.refreshTokens.findFirst({
      where: eq(refreshTokens.tokenHash, presentedHash),
    });
    if (!existing) return { ok: false as const };

    if (existing.revokedAt) {
      // Reuse of an already-rotated token: treat as compromised, kill the
      // whole rotation family so a stolen token can't keep refreshing.
      await tx
        .update(refreshTokens)
        .set({ revokedAt: new Date() })
        .where(
          and(eq(refreshTokens.familyId, existing.familyId), isNull(refreshTokens.revokedAt))
        );
      return { ok: false as const };
    }

    if (existing.expiresAt.getTime() < Date.now()) {
      return { ok: false as const };
    }

    const user = await tx.query.users.findFirst({ where: eq(users.id, existing.userId) });
    if (!user || !user.isActive) return { ok: false as const };

    const newToken = generateRefreshToken();
    const newHash = hashRefreshToken(newToken);
    const expiresAt = new Date(
      Date.now() + getRefreshTokenTtlDays() * 24 * 60 * 60 * 1000
    );

    await tx
      .update(refreshTokens)
      .set({ revokedAt: new Date(), replacedByHash: newHash })
      .where(eq(refreshTokens.id, existing.id));

    await tx.insert(refreshTokens).values({
      userId: existing.userId,
      tokenHash: newHash,
      familyId: existing.familyId,
      expiresAt,
      userAgent: meta?.userAgent,
      ip: meta?.ip,
    });

    return { ok: true as const, user, newToken };
  });

  if (!result.ok) throw invalidRefreshToken();

  const accessToken = await signAccessToken({
    userId: result.user.id,
    email: result.user.email,
    role: result.user.role,
  });

  return { accessToken, refreshToken: result.newToken };
}

export async function logout(presentedToken: string) {
  const presentedHash = hashRefreshToken(presentedToken);
  const existing = await db.query.refreshTokens.findFirst({
    where: eq(refreshTokens.tokenHash, presentedHash),
  });
  if (!existing) return;

  await db
    .update(refreshTokens)
    .set({ revokedAt: new Date() })
    .where(and(eq(refreshTokens.familyId, existing.familyId), isNull(refreshTokens.revokedAt)));
}

export async function logoutAll(userId: number) {
  await db
    .update(refreshTokens)
    .set({ revokedAt: new Date() })
    .where(and(eq(refreshTokens.userId, userId), isNull(refreshTokens.revokedAt)));
}

export async function getMe(userId: number) {
  return db.query.users.findFirst({
    where: eq(users.id, userId),
    with: { psychologistProfile: true },
  });
}

export async function updateAccount(
  userId: number,
  input: { fullName: string; phone: string }
) {
  if (input.fullName.trim().length < 2) {
    throw validationError("Ad soyad gereklidir.");
  }
  await db
    .update(users)
    .set({ fullName: input.fullName, phone: input.phone || null })
    .where(eq(users.id, userId));
}
