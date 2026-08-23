import { and, asc, eq, gt } from "drizzle-orm";
import { db } from "@/lib/db";
import { availabilitySlots } from "@/lib/db/schema";

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
