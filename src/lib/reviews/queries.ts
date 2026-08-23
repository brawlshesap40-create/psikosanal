import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { reviews } from "@/lib/db/schema";

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
