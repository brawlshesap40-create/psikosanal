"use server";

import { revalidatePath } from "next/cache";
import { verifyAdminSession } from "@/lib/auth/dal";
import { createDiscountCodeSchema } from "@/lib/validation/discount";
import { discountsService, DomainError } from "@psikosanal/core";

export type DiscountFormState = { error?: string } | undefined;

export async function createDiscountCodeAction(
  _prevState: DiscountFormState,
  formData: FormData
): Promise<DiscountFormState> {
  await verifyAdminSession();

  const maxUsesRaw = String(formData.get("maxUses") ?? "").trim();
  const validUntilRaw = String(formData.get("validUntil") ?? "").trim();

  const parsed = createDiscountCodeSchema.safeParse({
    code: String(formData.get("code") ?? "").trim(),
    kind: String(formData.get("kind") ?? "yuzde"),
    value: Number(formData.get("value")),
    appliesTo: String(formData.get("appliesTo") ?? "hepsi"),
    maxUses: maxUsesRaw ? Number(maxUsesRaw) : undefined,
    validUntil: validUntilRaw || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Bilgileri kontrol edin." };
  }

  try {
    await discountsService.createCode(parsed.data);
  } catch (error) {
    if (error instanceof DomainError) return { error: error.message };
    throw error;
  }

  revalidatePath("/admin/indirim-kodlari");
}

export async function toggleDiscountCodeAction(id: number, isActive: boolean) {
  await verifyAdminSession();
  await discountsService.toggleActive(id, isActive);
  revalidatePath("/admin/indirim-kodlari");
}
