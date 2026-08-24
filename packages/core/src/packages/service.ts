import { and, desc, eq, gt, sql } from "drizzle-orm";
import { db } from "@psikosanal/db";
import { packagePurchases, packages } from "@psikosanal/db/schema";
import type { createPackageSchema } from "../validation/package";
import type { z } from "zod";

export async function createPackage(
  psychologistId: number,
  input: z.infer<typeof createPackageSchema>
) {
  const [created] = await db
    .insert(packages)
    .values({ psychologistId, ...input })
    .returning();
  return created;
}

export async function toggleActive(psychologistId: number, packageId: number, isActive: boolean) {
  await db
    .update(packages)
    .set({ isActive })
    .where(and(eq(packages.id, packageId), eq(packages.psychologistId, psychologistId)));
}

export async function getActivePackagesForPsychologist(psychologistId: number) {
  return db.query.packages.findMany({
    where: and(eq(packages.psychologistId, psychologistId), eq(packages.isActive, true)),
    orderBy: [desc(packages.createdAt)],
  });
}

export async function getPackagesForPsychologist(psychologistId: number) {
  return db.query.packages.findMany({
    where: eq(packages.psychologistId, psychologistId),
    orderBy: [desc(packages.createdAt)],
  });
}

export async function getPackageById(id: number) {
  return db.query.packages.findFirst({ where: eq(packages.id, id) });
}

export async function getAvailablePackageCredit(clientId: number, psychologistId: number) {
  return db.query.packagePurchases.findFirst({
    where: and(
      eq(packagePurchases.clientId, clientId),
      eq(packagePurchases.psychologistId, psychologistId),
      gt(packagePurchases.sessionsRemaining, 0)
    ),
    orderBy: [packagePurchases.createdAt],
  });
}

export async function getPackagePurchasesForClient(clientId: number) {
  return db.query.packagePurchases.findMany({
    where: eq(packagePurchases.clientId, clientId),
    orderBy: [desc(packagePurchases.createdAt)],
    with: { package: true, psychologist: { with: { user: true } } },
  });
}

/**
 * Canonical implementation of "consume one session credit". Callers whose
 * write must be atomic with other writes in their own db.transaction()
 * (appointments' booking-via-credit flow, payments' booking flow) inline
 * this same decrement in their own transaction instead of calling this
 * function directly — see the cross-domain rule in the migration plan.
 */
export async function consumeCredit(purchaseId: number) {
  await db
    .update(packagePurchases)
    .set({ sessionsRemaining: sql`${packagePurchases.sessionsRemaining} - 1` })
    .where(eq(packagePurchases.id, purchaseId));
}

/** See consumeCredit's doc comment — same atomicity caveat applies. */
export async function refundCredit(purchaseId: number) {
  await db
    .update(packagePurchases)
    .set({ sessionsRemaining: sql`${packagePurchases.sessionsRemaining} + 1` })
    .where(eq(packagePurchases.id, purchaseId));
}
