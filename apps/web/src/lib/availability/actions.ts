"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { availabilitySlots, psychologistProfiles } from "@/lib/db/schema";
import { verifyPsikologSession } from "@/lib/auth/dal";
import { createSlotSchema } from "@/lib/validation/availability";

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

  const occurrences = Array.from({ length: parsed.data.repeatWeeks }, (_, index) => {
    const date = new Date(parsed.data.startTime);
    date.setDate(date.getDate() + index * 7);
    return date;
  });

  try {
    await db.insert(availabilitySlots).values(
      occurrences.map((startTime) => ({
        psychologistId,
        startTime,
        durationMinutes: parsed.data.durationMinutes,
        sessionType: parsed.data.sessionType,
        isIntro: parsed.data.isIntro,
      }))
    );
  } catch {
    return { error: "Seçilen saatlerden biri için zaten bir müsaitlik kaydı var." };
  }

  revalidatePath("/psikolog/musaitlik");
}

export async function deleteAvailabilitySlotAction(slotId: number) {
  const psychologistId = await requireOwnPsychologistId();

  await db
    .delete(availabilitySlots)
    .where(
      and(
        eq(availabilitySlots.id, slotId),
        eq(availabilitySlots.psychologistId, psychologistId),
        eq(availabilitySlots.status, "musait")
      )
    );

  revalidatePath("/psikolog/musaitlik");
}
