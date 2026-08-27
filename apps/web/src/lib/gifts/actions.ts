"use server";

import { revalidatePath } from "next/cache";
import { verifyDanisanSession } from "@/lib/auth/dal";
import { giftsService, DomainError } from "@psikosanal/core";

export type RedeemGiftState = { error?: string; success?: boolean } | undefined;

export async function redeemGiftVoucherAction(
  _prevState: RedeemGiftState,
  formData: FormData
): Promise<RedeemGiftState> {
  const session = await verifyDanisanSession();
  const code = String(formData.get("code") ?? "").trim();
  if (!code) return { error: "Bir kod girin." };

  try {
    await giftsService.redeemVoucher(code, session.userId);
  } catch (error) {
    if (error instanceof DomainError) return { error: error.message };
    throw error;
  }

  revalidatePath("/danisan/paketlerim");
  return { success: true };
}
