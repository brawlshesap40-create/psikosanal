"use server";

import { revalidatePath } from "next/cache";
import { verifyAdminSession, verifyPsikologSession } from "@/lib/auth/dal";
import { psychologistProfileSchema } from "@/lib/validation/psychologist";
import { psychologistsService } from "@psikosanal/core";

export async function approvePsychologistAction(psychologistId: number) {
  await verifyAdminSession();

  await psychologistsService.approve(psychologistId);

  revalidatePath("/admin/psikolog-basvurulari");
  revalidatePath("/admin/psikologlar");
}

export async function rejectPsychologistAction(psychologistId: number, reason: string) {
  await verifyAdminSession();

  await psychologistsService.reject(psychologistId, reason);

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

  const updated = await psychologistsService.updateProfile(session.userId, parsed.data);
  if (!updated) {
    return { error: "Profil bulunamadı." };
  }

  revalidatePath("/psikolog/profil");
  revalidatePath(`/psikologlar/${updated.slug}`);
  return { success: true };
}

export async function updatePsychologistPhotoAction(photoUrl: string) {
  const session = await verifyPsikologSession();

  await psychologistsService.updatePhoto(session.userId, photoUrl);

  revalidatePath("/psikolog/profil");
}
