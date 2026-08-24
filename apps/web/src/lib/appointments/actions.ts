"use server";

import { revalidatePath } from "next/cache";
import { verifyPsikologSession, getOptionalSession } from "@/lib/auth/dal";
import { appointmentsService, DomainError } from "@psikosanal/core";

export async function cancelAppointmentAction(
  appointmentId: number,
  reason?: string
): Promise<{ error?: string }> {
  const session = await getOptionalSession();
  if (!session) return { error: "Yetkisiz işlem" };

  try {
    await appointmentsService.cancel(session, appointmentId, reason);
  } catch (error) {
    if (error instanceof DomainError) return { error: error.message };
    throw error;
  }

  revalidatePath("/danisan/randevularim");
  revalidatePath("/psikolog/randevularim");
  return {};
}

export async function markAppointmentCompletedAction(
  appointmentId: number
): Promise<{ error?: string }> {
  const session = await verifyPsikologSession();

  try {
    await appointmentsService.markCompleted(session.userId, appointmentId);
  } catch (error) {
    if (error instanceof DomainError) return { error: error.message };
    throw error;
  }

  revalidatePath("/psikolog/randevularim");
  return {};
}

export async function markNoShowAction(
  appointmentId: number,
  party: "danisan" | "psikolog"
): Promise<{ error?: string }> {
  const session = await verifyPsikologSession();

  try {
    await appointmentsService.markNoShow(session.userId, appointmentId, party);
  } catch (error) {
    if (error instanceof DomainError) return { error: error.message };
    throw error;
  }

  revalidatePath("/psikolog/randevularim");
  return {};
}
