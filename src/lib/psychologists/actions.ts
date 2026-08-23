"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { psychologistProfiles, psychologistSpecialties } from "@/lib/db/schema";
import { verifyAdminSession, verifyPsikologSession } from "@/lib/auth/dal";
import { psychologistProfileSchema } from "@/lib/validation/psychologist";

export async function approvePsychologistAction(psychologistId: number) {
  await verifyAdminSession();

  await db
    .update(psychologistProfiles)
    .set({ approvalStatus: "onaylandi", adminNote: null })
    .where(eq(psychologistProfiles.id, psychologistId));

  revalidatePath("/admin/psikolog-basvurulari");
  revalidatePath("/admin/psikologlar");
}

export async function rejectPsychologistAction(
  psychologistId: number,
  reason: string
) {
  await verifyAdminSession();

  await db
    .update(psychologistProfiles)
    .set({ approvalStatus: "reddedildi", adminNote: reason })
    .where(eq(psychologistProfiles.id, psychologistId));

  revalidatePath("/admin/psikolog-basvurulari");
}

export type ProfileFormState = { error?: string; success?: boolean } | undefined;

export async function updatePsychologistProfileAction(
  _prevState: ProfileFormState,
  formData: FormData
): Promise<ProfileFormState> {
  const session = await verifyPsikologSession();

  const specialtyIds = formData
    .getAll("specialtyIds")
    .map((value) => Number(value))
    .filter((value) => !Number.isNaN(value));

  const parsed = psychologistProfileSchema.safeParse({
    title: String(formData.get("title") ?? "").trim(),
    bio: String(formData.get("bio") ?? "").trim(),
    experienceYears: Number(formData.get("experienceYears") ?? 0),
    sessionPriceTl: Number(formData.get("sessionPriceTl") ?? 0),
    city: String(formData.get("city") ?? "").trim(),
    onlineAvailable: formData.get("onlineAvailable") === "on",
    inPersonAvailable: formData.get("inPersonAvailable") === "on",
    specialtyIds,
    gender: String(formData.get("gender") ?? "belirtilmemis"),
    languages: formData.getAll("languages").map(String),
    approaches: formData.getAll("approaches").map(String),
    introCallEnabled: formData.get("introCallEnabled") === "on",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Bilgileri kontrol edin." };
  }

  const profile = await db.query.psychologistProfiles.findFirst({
    where: eq(psychologistProfiles.userId, session.userId),
  });
  if (!profile) {
    return { error: "Profil bulunamadı." };
  }

  const { specialtyIds: newSpecialtyIds, ...rest } = parsed.data;

  await db.transaction(async (tx) => {
    await tx
      .update(psychologistProfiles)
      .set(rest)
      .where(eq(psychologistProfiles.id, profile.id));

    await tx
      .delete(psychologistSpecialties)
      .where(eq(psychologistSpecialties.psychologistId, profile.id));

    if (newSpecialtyIds.length > 0) {
      await tx.insert(psychologistSpecialties).values(
        newSpecialtyIds.map((specialtyId) => ({
          psychologistId: profile.id,
          specialtyId,
        }))
      );
    }
  });

  revalidatePath("/psikolog/profil");
  revalidatePath(`/psikologlar/${profile.slug}`);
  return { success: true };
}

export async function updatePsychologistPhotoAction(photoUrl: string) {
  const session = await verifyPsikologSession();

  await db
    .update(psychologistProfiles)
    .set({ photoUrl })
    .where(eq(psychologistProfiles.userId, session.userId));

  revalidatePath("/psikolog/profil");
}
