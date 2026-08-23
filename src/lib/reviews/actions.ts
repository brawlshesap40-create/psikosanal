"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { appointments, psychologistProfiles, reviews } from "@/lib/db/schema";
import { verifyAdminSession, verifyDanisanSession } from "@/lib/auth/dal";
import { createReviewSchema } from "@/lib/validation/review";
import { createNotification } from "@/lib/notifications/actions";

export type ReviewFormState = { error?: string; success?: boolean } | undefined;

export async function createReviewAction(
  _prevState: ReviewFormState,
  formData: FormData
): Promise<ReviewFormState> {
  const session = await verifyDanisanSession();

  const parsed = createReviewSchema.safeParse({
    appointmentId: Number(formData.get("appointmentId")),
    rating: Number(formData.get("rating")),
    comment: String(formData.get("comment") ?? "").trim() || undefined,
  });
  if (!parsed.success) {
    return { error: "Geçersiz değerlendirme." };
  }
  const { appointmentId, rating, comment } = parsed.data;

  const appointment = await db.query.appointments.findFirst({
    where: eq(appointments.id, appointmentId),
  });
  if (!appointment || appointment.clientId !== session.userId) {
    return { error: "Yetkisiz işlem." };
  }
  if (appointment.status !== "tamamlandi") {
    return { error: "Sadece tamamlanan randevular değerlendirilebilir." };
  }

  try {
    await db.insert(reviews).values({
      appointmentId,
      clientId: session.userId,
      psychologistId: appointment.psychologistId,
      rating,
      comment,
    });
  } catch {
    return { error: "Bu randevu için zaten bir değerlendirme yapılmış." };
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

  revalidatePath("/danisan/randevularim");
  return { success: true };
}

export type ModerationState = { error?: string } | undefined;

export async function approveReviewAction(reviewId: number) {
  await verifyAdminSession();
  await db.update(reviews).set({ isApproved: true, moderatedAt: new Date() }).where(eq(reviews.id, reviewId));
  revalidatePath("/admin/yorumlar");
}

export async function rejectReviewAction(reviewId: number) {
  await verifyAdminSession();
  await db.delete(reviews).where(eq(reviews.id, reviewId));
  revalidatePath("/admin/yorumlar");
}
