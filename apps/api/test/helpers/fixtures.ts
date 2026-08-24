import { randomUUID } from "crypto";
import { db } from "@psikosanal/db";
import { appointments, availabilitySlots, psychologistProfiles, users } from "@psikosanal/db/schema";

let counter = 0;

export async function createPsychologist(overrides: Partial<typeof psychologistProfiles.$inferInsert> = {}) {
  counter += 1;
  const [user] = await db
    .insert(users)
    .values({
      email: `test.psikolog.${counter}@example.com`,
      passwordHash: "not-a-real-hash",
      role: "psikolog",
      fullName: `Test Psikolog ${counter}`,
    })
    .returning();

  const [profile] = await db
    .insert(psychologistProfiles)
    .values({
      userId: user.id,
      slug: `test-psikolog-${counter}`,
      title: "Klinik Psikolog",
      approvalStatus: "onaylandi",
      ...overrides,
    })
    .returning();

  return { user, profile };
}

export async function createAppointment(params: {
  clientId: number;
  psychologistId: number;
  status?: typeof appointments.$inferInsert.status;
  startTime?: Date;
}) {
  const [slot] = await db
    .insert(availabilitySlots)
    .values({
      psychologistId: params.psychologistId,
      startTime: params.startTime ?? new Date(Date.now() + 24 * 60 * 60 * 1000),
      status: "dolu",
    })
    .returning();

  const [appointment] = await db
    .insert(appointments)
    .values({
      slotId: slot.id,
      clientId: params.clientId,
      psychologistId: params.psychologistId,
      status: params.status ?? "onaylandi",
      videoRoomName: randomUUID(),
    })
    .returning();

  return { slot, appointment };
}
