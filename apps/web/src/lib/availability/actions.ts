"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { psychologistProfiles } from "@/lib/db/schema";
import { verifyPsikologSession } from "@/lib/auth/dal";
import { createSlotSchema } from "@/lib/validation/availability";
import { availabilityService, DomainError } from "@psikosanal/core";

export type SlotFormState = { error?: string } | undefined;

async function requireOwnPsychologistId() {
  const session = await verifyPsikologSession();
  const profile = await db.query.psychologistProfiles.findFirst({
    where: eq(psychologistProfiles.userId, session.userId),
  });
  if (!profile) throw new Error("Psikolog profili bulunamadı");
  return profile.id;
}

export async function createAvailabilitySlotAction(
  _prevState: SlotFormState,
  formData: FormData
): Promise<SlotFormState> {
  const psychologistId = await requireOwnPsychologistId();

  const parsed = createSlotSchema.safeParse({
    startTime: String(formData.get("startTime") ?? ""),
    durationMinutes: Number(formData.get("durationMinutes") ?? 50),
    sessionType: String(formData.get("sessionType") ?? "bireysel"),
    isIntro: formData.get("isIntro") === "on",
    repeatWeeks: Number(formData.get("repeatWeeks") ?? 1),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Bilgileri kontrol edin." };
  }

  try {
    await availabilityService.createSlots(psychologistId, parsed.data);
  } catch (error) {
    if (error instanceof DomainError) return { error: error.message };
    throw error;
  }

  revalidatePath("/psikolog/musaitlik");
}

export async function deleteAvailabilitySlotAction(slotId: number) {
  const psychologistId = await requireOwnPsychologistId();

  await availabilityService.deleteSlot(psychologistId, slotId);

  revalidatePath("/psikolog/musaitlik");
}
