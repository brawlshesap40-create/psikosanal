"use server";

import { revalidatePath } from "next/cache";
import { verifyAdminSession, verifyDanisanSession } from "@/lib/auth/dal";
import { createReviewSchema } from "@/lib/validation/review";
import { reviewsService, DomainError } from "@psikosanal/core";

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

  try {
    await reviewsService.createReview(session.userId, parsed.data);
  } catch (error) {
    if (error instanceof DomainError) return { error: error.message };
    throw error;
  }

  revalidatePath("/danisan/randevularim");
  return { success: true };
}

export type ModerationState = { error?: string } | undefined;

export async function approveReviewAction(reviewId: number) {
  await verifyAdminSession();
  await reviewsService.approveReview(reviewId);
  revalidatePath("/admin/yorumlar");
}

export async function rejectReviewAction(reviewId: number) {
  await verifyAdminSession();
  await reviewsService.rejectReview(reviewId);
  revalidatePath("/admin/yorumlar");
}
