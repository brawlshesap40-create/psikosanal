"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { waitlistEntries } from "@/lib/db/schema";
import { verifyDanisanSession } from "@/lib/auth/dal";

export async function joinWaitlistAction(psychologistId: number, slug: string) {
  const session = await verifyDanisanSession();

  const existing = await db.query.waitlistEntries.findFirst({
    where: and(
      eq(waitlistEntries.clientId, session.userId),
      eq(waitlistEntries.psychologistId, psychologistId)
    ),
  });
  if (!existing) {
    await db.insert(waitlistEntries).values({ clientId: session.userId, psychologistId });
  }

  revalidatePath(`/psikologlar/${slug}`);
  return { joined: true };
}
