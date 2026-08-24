import { and, eq } from "drizzle-orm";
import { db } from "@psikosanal/db";
import { waitlistEntries } from "@psikosanal/db/schema";
import { createNotification } from "../notifications/service";

export async function joinWaitlist(clientId: number, psychologistId: number) {
  const existing = await db.query.waitlistEntries.findFirst({
    where: and(
      eq(waitlistEntries.clientId, clientId),
      eq(waitlistEntries.psychologistId, psychologistId)
    ),
  });
  if (!existing) {
    await db.insert(waitlistEntries).values({ clientId, psychologistId });
  }

  return { joined: true };
}

export async function isOnWaitlist(clientId: number, psychologistId: number) {
  const existing = await db.query.waitlistEntries.findFirst({
    where: and(
      eq(waitlistEntries.clientId, clientId),
      eq(waitlistEntries.psychologistId, psychologistId)
    ),
  });
  return Boolean(existing);
}

/**
 * Notifies every client waiting on `psychologistId` that a new slot opened
 * up, and stamps `notifiedAt`. Not required to be atomic with whatever
 * freed the slot (e.g. an appointment cancellation) — callers run this as a
 * post-commit step, not inside their own db.transaction().
 */
export async function notifyWaitingClients(psychologistId: number, params: { link: string }) {
  const waiting = await db.query.waitlistEntries.findMany({
    where: eq(waitlistEntries.psychologistId, psychologistId),
  });

  for (const entry of waiting) {
    await createNotification({
      userId: entry.clientId,
      type: "musaitlik_bildirimi",
      title: "Beklediğiniz psikologda yeni müsaitlik açıldı",
      link: params.link,
    });
  }

  if (waiting.length > 0) {
    await db
      .update(waitlistEntries)
      .set({ notifiedAt: new Date() })
      .where(eq(waitlistEntries.psychologistId, psychologistId));
  }
}
