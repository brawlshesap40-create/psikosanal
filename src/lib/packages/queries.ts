import { and, desc, eq, gt } from "drizzle-orm";
import { db } from "@/lib/db";
import { packagePurchases, packages } from "@/lib/db/schema";

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

export async function getAvailablePackageCredit(
  clientId: number,
  psychologistId: number
) {
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
