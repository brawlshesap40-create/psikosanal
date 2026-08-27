import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "@psikosanal/db";
import { appointments, psychologistProfiles, reviews } from "@psikosanal/db/schema";
import { createNotification } from "../notifications/service";
import { forbidden } from "../auth/errors";
import { appointmentNotCompleted, reviewAlreadyExists } from "./errors";
import type { createReviewSchema } from "../validation/review";
import type { z } from "zod";

// Reads the appointments table directly since the appointments domain
// hasn't migrated yet (Phase 11) — retrofit to call appointmentsService's
// query once it exists, purely for consistency with the cross-domain rule.
export async function createReview(clientId: number, input: z.infer<typeof createReviewSchema>) {
  const appointment = await db.query.appointments.findFirst({
    where: eq(appointments.id, input.appointmentId),
  });
  if (!appointment || appointment.clientId !== clientId) throw forbidden();
  if (appointment.status !== "tamamlandi") throw appointmentNotCompleted();

  try {
    await db.insert(reviews).values({
      appointmentId: input.appointmentId,
      clientId,
      psychologistId: appointment.psychologistId,
      rating: input.rating,
      comment: input.comment,
    });
  } catch {
    throw reviewAlreadyExists();
  }

  const psychologist = await db.query.psychologistProfiles.findFirst({
    where: eq(psychologistProfiles.id, appointment.psychologistId),
  });
  if (psychologist) {
    await createNotification({
      userId: psychologist.userId,
      type: "yeni_yorum",
      title: "Yeni bir değerlendirme aldınız",
      body: "Değerlendirme, yayınlanmadan önce admin onayı bekliyor.",
    });
  }
}

export async function approveReview(reviewId: number) {
  await db
    .update(reviews)
    .set({ isApproved: true, moderatedAt: new Date() })
    .where(eq(reviews.id, reviewId));
}

export async function rejectReview(reviewId: number) {
  await db.delete(reviews).where(eq(reviews.id, reviewId));
}

export async function getReviewsForPsychologist(psychologistId: number) {
  return db.query.reviews.findMany({
    where: and(eq(reviews.psychologistId, psychologistId), eq(reviews.isApproved, true)),
    orderBy: [desc(reviews.createdAt)],
    with: { client: true },
  });
}

export async function getReviewStats(psychologistId: number) {
  const [row] = await db
    .select({
      average: sql<number>`coalesce(avg(${reviews.rating}), 0)`,
      count: sql<number>`count(*)`,
    })
    .from(reviews)
    .where(and(eq(reviews.psychologistId, psychologistId), eq(reviews.isApproved, true)));
  return { average: Number(row?.average ?? 0), count: Number(row?.count ?? 0) };
}

export async function getPendingReviews() {
  return db.query.reviews.findMany({
    where: eq(reviews.isApproved, false),
    orderBy: [desc(reviews.createdAt)],
    with: { client: true, psychologist: { with: { user: true } } },
  });
}

export async function getReviewByAppointmentId(appointmentId: number) {
  return db.query.reviews.findFirst({
    where: eq(reviews.appointmentId, appointmentId),
  });
}

/** Approved reviews with a written comment, for homepage testimonials. */
export async function getFeaturedReviews(limit = 3) {
  return db.query.reviews.findMany({
    where: and(eq(reviews.isApproved, true), sql`${reviews.comment} is not null`),
    orderBy: [desc(reviews.rating), desc(reviews.createdAt)],
    limit,
    with: { client: true, psychologist: { with: { user: true } } },
  });
}

export async function getOverallReviewStats() {
  const [row] = await db
    .select({
      average: sql<number>`coalesce(avg(${reviews.rating}), 0)`,
      count: sql<number>`count(*)`,
    })
    .from(reviews)
    .where(eq(reviews.isApproved, true));
  return { average: Number(row?.average ?? 0), count: Number(row?.count ?? 0) };
}
