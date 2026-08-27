"use server";

import { revalidatePath } from "next/cache";
import { verifyAdminSession } from "@/lib/auth/dal";
import { corporateLeadSchema } from "@/lib/validation/corporate";
import { corporateService } from "@psikosanal/core";

export type CorporateFormState = { error?: string; success?: boolean } | undefined;

export async function submitCorporateLeadAction(
  _prevState: CorporateFormState,
  formData: FormData
): Promise<CorporateFormState> {
  const parsed = corporateLeadSchema.safeParse({
    companyName: String(formData.get("companyName") ?? "").trim(),
    contactName: String(formData.get("contactName") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim(),
    phone: String(formData.get("phone") ?? "").trim() || undefined,
    employeeCountRange: String(formData.get("employeeCountRange") ?? "").trim() || undefined,
    message: String(formData.get("message") ?? "").trim() || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Bilgileri kontrol edin." };
  }

  await corporateService.submitLead(parsed.data);
  return { success: true };
}

export async function updateCorporateLeadStatusAction(
  id: number,
  status: corporateService.CorporateLeadStatus
) {
  await verifyAdminSession();
  await corporateService.updateLeadStatus(id, status);
  revalidatePath("/admin/kurumsal-talepler");
}
