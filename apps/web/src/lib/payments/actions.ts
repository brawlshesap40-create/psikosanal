"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { verifyAdminSession, verifyDanisanSession } from "@/lib/auth/dal";
import { siteConfig } from "@/lib/site-config";
import { paymentsService, DomainError } from "@psikosanal/core";

export type PaymentInitiateState =
  | { error?: string; checkoutFormContent?: string }
  | undefined;

async function requestIp() {
  const headerList = await headers();
  const forwardedFor = headerList.get("x-forwarded-for");
  return forwardedFor?.split(",")[0]?.trim() || "85.34.78.112";
}

export async function initiateBookingAction(
  _prevState: PaymentInitiateState,
  formData: FormData
): Promise<PaymentInitiateState> {
  const session = await verifyDanisanSession();

  const slotId = Number(formData.get("slotId"));
  const clientNote = String(formData.get("clientNote") ?? "").trim() || null;
  if (!slotId) return { error: "Geçersiz randevu talebi." };

  let result;
  try {
    result = await paymentsService.initiateBooking(
      session.userId,
      { slotId, clientNote },
      { ip: await requestIp(), callbackUrl: `${siteConfig.siteUrl}/api/payments/callback` }
    );
  } catch (error) {
    if (error instanceof DomainError) return { error: error.message };
    throw error;
  }

  if (result.kind === "booked") {
    revalidatePath("/danisan/randevularim");
    redirect("/danisan/randevularim");
  }

  return { checkoutFormContent: result.checkoutFormContent };
}

export async function initiatePackagePurchaseAction(
  _prevState: PaymentInitiateState,
  formData: FormData
): Promise<PaymentInitiateState> {
  const session = await verifyDanisanSession();
  const packageId = Number(formData.get("packageId"));

  try {
    const result = await paymentsService.initiatePackagePurchase(session.userId, packageId, {
      ip: await requestIp(),
      callbackUrl: `${siteConfig.siteUrl}/api/payments/callback`,
    });
    return { checkoutFormContent: result.checkoutFormContent };
  } catch (error) {
    if (error instanceof DomainError) return { error: error.message };
    throw error;
  }
}

export const finalizePaymentByToken = paymentsService.finalizeByToken;

export type RefundState = { error?: string } | undefined;

export async function refundPaymentAction(paymentId: number): Promise<RefundState> {
  await verifyAdminSession();

  try {
    await paymentsService.refundPayment(paymentId, { ip: await requestIp() });
  } catch (error) {
    if (error instanceof DomainError) return { error: error.message };
    throw error;
  }

  revalidatePath("/admin/randevular");
  return {};
}
