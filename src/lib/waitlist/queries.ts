import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { waitlistEntries } from "@/lib/db/schema";

export async function isOnWaitlist(clientId: number, psychologistId: number) {
  const existing = await db.query.waitlistEntries.findFirst({
    where: and(
      eq(waitlistEntries.clientId, clientId),
      eq(waitlistEntries.psychologistId, psychologistId)
    ),
  });
  return Boolean(existing);
}
