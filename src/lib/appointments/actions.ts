"use server";

import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import {
  appointments,
  availabilitySlots,
  packagePurchases,
  waitlistEntries,
} from "@/lib/db/schema";
import {
  verifyPsikologSession,
  getOptionalSession,
} from "@/lib/auth/dal";
import { createNotification } from "@/lib/notifications/actions";
import { CANCELLATION_WINDOW_HOURS } from "./constants";

export async function cancelAppointmentAction(
  appointmentId: number,
  reason?: string
): Promise<{ error?: string }> {
  const session = await getOptionalSession();
  if (!session || (session.role !== "danisan" && session.role !== "psikolog")) {
    return { error: "Yetkisiz işlem" };
  }

  const appointment = await db.query.appointments.findFirst({
    where: eq(appointments.id, appointmentId),
    with: { slot: true, psychologist: true },
  });
  if (!appointment) return { error: "Randevu bulunamadı" };

  if (session.role === "danisan" && appointment.clientId !== session.userId) {
    return { error: "Yetkisiz işlem" };
  }
  if (session.role === "psikolog") {
    const profile = await db.query.psychologistProfiles.findFirst({
      where: (fields, { eq }) => eq(fields.userId, session.userId),
    });
    if (!profile || appointment.psychologistId !== profile.id) {
      return { error: "Yetkisiz işlem" };
    }
  }

  if (session.role === "danisan" && appointment.status === "onaylandi") {
    const hoursUntilStart =
      (appointment.slot.startTime.getTime() - Date.now()) / (1000 * 60 * 60);
    if (hoursUntilStart < CANCELLATION_WINDOW_HOURS) {
      return {
        error: `Randevuyu başlamasına ${CANCELLATION_WINDOW_HOURS} saatten az kala iptal edemezsiniz. Lütfen psikoloğunuzla iletişime geçin.`,
      };
    }
  }

  await db.transaction(async (tx) => {
    await tx
      .update(appointments)
      .set({
        status: "iptal_edildi",
        cancelledBy: session.role,
        cancelReason: reason ?? null,
      })
      .where(eq(appointments.id, appointmentId));

    await tx
      .update(availabilitySlots)
      .set({ status: "musait" })
      .where(eq(availabilitySlots.id, appointment.slotId));

    if (appointment.usedPackagePurchaseId) {
      await tx
        .update(packagePurchases)
        .set({ sessionsRemaining: sql`${packagePurchases.sessionsRemaining} + 1` })
        .where(eq(packagePurchases.id, appointment.usedPackagePurchaseId));
    }
  });

  const notifyUserId =
    session.role === "danisan" ? appointment.psychologist.userId : appointment.clientId;
  await createNotification({
    userId: notifyUserId,
    type: "randevu_iptal",
    title: "Randevu iptal edildi",
    body: reason || undefined,
    link: session.role === "danisan" ? "/psikolog/randevularim" : "/danisan/randevularim",
  });

  const waiting = await db.query.waitlistEntries.findMany({
    where: eq(waitlistEntries.psychologistId, appointment.psychologistId),
  });
  for (const entry of waiting) {
    await createNotification({
      userId: entry.clientId,
      type: "musaitlik_bildirimi",
      title: "Beklediğiniz psikologda yeni müsaitlik açıldı",
      link: `/psikologlar/${appointment.psychologist.slug}`,
    });
  }
  if (waiting.length > 0) {
    await db
      .update(waitlistEntries)
      .set({ notifiedAt: new Date() })
      .where(eq(waitlistEntries.psychologistId, appointment.psychologistId));
  }

  revalidatePath("/danisan/randevularim");
  revalidatePath("/psikolog/randevularim");
  return {};
}

export async function markAppointmentCompletedAction(
  appointmentId: number
): Promise<{ error?: string }> {
  const session = await verifyPsikologSession();

  const appointment = await db.query.appointments.findFirst({
    where: eq(appointments.id, appointmentId),
  });
  if (!appointment) return { error: "Randevu bulunamadı" };

  const profile = await db.query.psychologistProfiles.findFirst({
    where: (fields, { eq }) => eq(fields.userId, session.userId),
  });
  if (!profile || appointment.psychologistId !== profile.id) {
    return { error: "Yetkisiz işlem" };
  }

  await db
    .update(appointments)
    .set({ status: "tamamlandi" })
    .where(eq(appointments.id, appointmentId));

  revalidatePath("/psikolog/randevularim");
  return {};
}

export async function markNoShowAction(
  appointmentId: number,
  party: "danisan" | "psikolog"
): Promise<{ error?: string }> {
  const session = await verifyPsikologSession();

  const appointment = await db.query.appointments.findFirst({
    where: eq(appointments.id, appointmentId),
  });
  if (!appointment) return { error: "Randevu bulunamadı" };

  const profile = await db.query.psychologistProfiles.findFirst({
    where: (fields, { eq }) => eq(fields.userId, session.userId),
  });
  if (!profile || appointment.psychologistId !== profile.id) {
    return { error: "Yetkisiz işlem" };
  }
  if (appointment.status !== "onaylandi") {
    return { error: "Sadece onaylanmış randevular için işaretlenebilir." };
  }

  await db
    .update(appointments)
    .set({ status: "iptal_edildi", noShowBy: party, cancelReason: "Randevuya gelinmedi" })
    .where(eq(appointments.id, appointmentId));

  revalidatePath("/psikolog/randevularim");
  return {};
}
