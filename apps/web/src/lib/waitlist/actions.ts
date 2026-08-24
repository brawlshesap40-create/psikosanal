"use server";

import { revalidatePath } from "next/cache";
import { waitlistService } from "@psikosanal/core";
import { verifyDanisanSession } from "@/lib/auth/dal";

export async function joinWaitlistAction(psychologistId: number, slug: string) {
  const session = await verifyDanisanSession();

  const result = await waitlistService.joinWaitlist(session.userId, psychologistId);

  revalidatePath(`/psikologlar/${slug}`);
  return result;
}
