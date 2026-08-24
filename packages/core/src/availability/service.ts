import { and, asc, eq, gt } from "drizzle-orm";
import { db } from "@psikosanal/db";
import { availabilitySlots } from "@psikosanal/db/schema";
import type { createSlotSchema } from "../validation/availability";
import { slotConflict } from "./errors";
import type { z } from "zod";

export async function createSlots(
  psychologistId: number,
  input: z.infer<typeof createSlotSchema>
) {
  const occurrences = Array.from({ length: input.repeatWeeks }, (_, index) => {
    const date = new Date(input.startTime);
    date.setDate(date.getDate() + index * 7);
    return date;
  });

  try {
    await db.insert(availabilitySlots).values(
      occurrences.map((startTime) => ({
        psychologistId,
        startTime,
        durationMinutes: input.durationMinutes,
        sessionType: input.sessionType,
        isIntro: input.isIntro,
      }))
    );
  } catch {
    throw slotConflict();
  }
}

export async function deleteSlot(psychologistId: number, slotId: number) {
  await db
    .delete(availabilitySlots)
    .where(
      and(
        eq(availabilitySlots.id, slotId),
        eq(availabilitySlots.psychologistId, psychologistId),
        eq(availabilitySlots.status, "musait")
      )
    );
}

export async function getBookableSlots(psychologistId: number) {
  return db.query.availabilitySlots.findMany({
    where: and(
      eq(availabilitySlots.psychologistId, psychologistId),
      eq(availabilitySlots.status, "musait"),
      gt(availabilitySlots.startTime, new Date())
    ),
    orderBy: [asc(availabilitySlots.startTime)],
  });
}

export async function getSlotsForPsychologist(psychologistId: number) {
  return db.query.availabilitySlots.findMany({
    where: eq(availabilitySlots.psychologistId, psychologistId),
    orderBy: [asc(availabilitySlots.startTime)],
  });
}

export async function getSlotById(id: number) {
  return db.query.availabilitySlots.findFirst({
    where: eq(availabilitySlots.id, id),
  });
}
