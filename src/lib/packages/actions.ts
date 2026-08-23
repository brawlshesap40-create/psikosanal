"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { packages, psychologistProfiles } from "@/lib/db/schema";
import { verifyPsikologSession } from "@/lib/auth/dal";
import { createPackageSchema } from "@/lib/validation/package";

export type PackageFormState = { error?: string } | undefined;

async function requireOwnPsychologistId() {
  const session = await verifyPsikologSession();
  const profile = await db.query.psychologistProfiles.findFirst({
    where: eq(psychologistProfiles.userId, session.userId),
  });
  if (!profile) throw new Error("Psikolog profili bulunamadı");
  return profile.id;
}

export async function createPackageAction(
  _prevState: PackageFormState,
  formData: FormData
): Promise<PackageFormState> {
  const psychologistId = await requireOwnPsychologistId();

  const parsed = createPackageSchema.safeParse({
    name: String(formData.get("name") ?? "").trim(),
    sessionCount: Number(formData.get("sessionCount")),
    priceTl: Number(formData.get("priceTl")),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Bilgileri kontrol edin." };
  }

  await db.insert(packages).values({ psychologistId, ...parsed.data });

  revalidatePath("/psikolog/paketler");
}

export async function togglePackageActiveAction(packageId: number, isActive: boolean) {
  const psychologistId = await requireOwnPsychologistId();

  await db
    .update(packages)
    .set({ isActive })
    .where(and(eq(packages.id, packageId), eq(packages.psychologistId, psychologistId)));

  revalidatePath("/psikolog/paketler");
}
