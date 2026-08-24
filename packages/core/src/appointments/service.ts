import { desc, eq, sql } from "drizzle-orm";
import { db } from "@psikosanal/db";
import {
  appointments,
  availabilitySlots,
  packagePurchases,
  psychologistProfiles,
} from "@psikosanal/db/schema";
import { createNotification } from "../notifications/service";
import { notifyWaitingClients } from "../waitlist/service";
import { forbidden } from "../auth/errors";
import { appointmentNotConfirmed, appointmentNotFound, cancellationWindowPassed } from "./errors";
import type { UserRole } from "../auth/session-types";

export const CANCELLATION_WINDOW_HOURS = 24;

export async function cancel(
  session: { userId: number; role: UserRole },
  appointmentId: number,
  reason?: string
) {
  if (session.role !== "danisan" && session.role !== "psikolog") throw forbidden();

  const appointment = await db.query.appointments.findFirst({
    where: eq(appointments.id, appointmentId),
    with: { slot: true, psychologist: true },
  });
  if (!appointment) throw appointmentNotFound();

  if (session.role === "danisan" && appointment.clientId !== session.userId) {
    throw forbidden();
  }
  if (session.role === "psikolog") {
    const profile = await db.query.psychologistProfiles.findFirst({
      where: eq(psychologistProfiles.userId, session.userId),
    });
    if (!profile || appointment.psychologistId !== profile.id) throw forbidden();
  }

  if (session.role === "danisan" && appointment.status === "onaylandi") {
    const hoursUntilStart = (appointment.slot.startTime.getTime() - Date.now()) / (1000 * 60 * 60);
    if (hoursUntilStart < CANCELLATION_WINDOW_HOURS) {
      throw cancellationWindowPassed(CANCELLATION_WINDOW_HOURS);
    }
  }

  await db.transaction(async (tx) => {
    await tx
      .update(appointments)
      .set({ status: "iptal_edildi", cancelledBy: session.role, cancelReason: reason ?? null })
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

  await notifyWaitingClients(appointment.psychologistId, {
    link: `/psikologlar/${appointment.psychologist.slug}`,
  });
}

async function requireOwnAppointment(userId: number, appointmentId: number) {
  const appointment = await db.query.appointments.findFirst({
    where: eq(appointments.id, appointmentId),
  });
  if (!appointment) throw appointmentNotFound();

  const profile = await db.query.psychologistProfiles.findFirst({
    where: eq(psychologistProfiles.userId, userId),
  });
  if (!profile || appointment.psychologistId !== profile.id) throw forbidden();

  return appointment;
}

export async function markCompleted(userId: number, appointmentId: number) {
  await requireOwnAppointment(userId, appointmentId);

  await db.update(appointments).set({ status: "tamamlandi" }).where(eq(appointments.id, appointmentId));
}

export async function markNoShow(
  userId: number,
  appointmentId: number,
  party: "danisan" | "psikolog"
) {
  const appointment = await requireOwnAppointment(userId, appointmentId);
  if (appointment.status !== "onaylandi") throw appointmentNotConfirmed();

  await db
    .update(appointments)
    .set({ status: "iptal_edildi", noShowBy: party, cancelReason: "Randevuya gelinmedi" })
    .where(eq(appointments.id, appointmentId));
}

export async function getAppointmentsForClient(clientId: number) {
  return db.query.appointments.findMany({
    where: eq(appointments.clientId, clientId),
    orderBy: [desc(appointments.createdAt)],
    with: {
      slot: true,
      psychologist: { with: { user: true } },
      review: true,
    },
  });
}

export async function getAppointmentsForPsychologist(psychologistId: number) {
  return db.query.appointments.findMany({
    where: eq(appointments.psychologistId, psychologistId),
    orderBy: [desc(appointments.createdAt)],
    with: {
      slot: true,
      client: true,
    },
  });
}

export async function getAppointmentById(id: number) {
  return db.query.appointments.findFirst({
    where: eq(appointments.id, id),
    with: {
      slot: true,
      client: true,
      psychologist: { with: { user: true } },
    },
  });
}

export async function getAllAppointments() {
  return db.query.appointments.findMany({
    orderBy: [desc(appointments.createdAt)],
    with: {
      slot: true,
      client: true,
      psychologist: { with: { user: true } },
    },
  });
}
