"use server";

import { redirect } from "next/navigation";
import { uploadDocument } from "@/lib/storage/upload";
import { authService, DomainError } from "@psikosanal/core";
import {
  loginSchema,
  registerDanisanSchema,
  registerPsikologSchema,
} from "@/lib/validation/auth";
import { createSession, deleteSession } from "./session";
import { getOptionalSession } from "./dal";

export type FormState = { error?: string } | undefined;

function redirectForRole(role: "danisan" | "psikolog" | "admin", next: string) {
  if (next.startsWith("/") && !next.startsWith("//")) redirect(next);
  if (role === "danisan") redirect("/danisan/randevularim");
  if (role === "psikolog") redirect("/psikolog/panel");
  redirect("/admin/dashboard");
}

export async function loginAction(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const parsed = loginSchema.safeParse({
    email: String(formData.get("email") ?? "").trim().toLowerCase(),
    password: String(formData.get("password") ?? ""),
  });
  if (!parsed.success) {
    return { error: "E-posta ve şifre gereklidir." };
  }
  const next = String(formData.get("next") ?? "");

  let user: Awaited<ReturnType<typeof authService.login>>["user"];
  try {
    ({ user } = await authService.login({
      ...parsed.data,
      allowedRoles: ["danisan", "psikolog"],
      issueTokens: false,
    }));
  } catch (error) {
    if (error instanceof DomainError) return { error: error.message };
    throw error;
  }

  await createSession(user.id, user.email, user.role);
  redirectForRole(user.role, next);
}

export async function adminLoginAction(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const parsed = loginSchema.safeParse({
    email: String(formData.get("email") ?? "").trim().toLowerCase(),
    password: String(formData.get("password") ?? ""),
  });
  if (!parsed.success) {
    return { error: "E-posta ve şifre gereklidir." };
  }

  let user: Awaited<ReturnType<typeof authService.login>>["user"];
  try {
    ({ user } = await authService.login({
      ...parsed.data,
      allowedRoles: ["admin"],
      issueTokens: false,
    }));
  } catch (error) {
    if (error instanceof DomainError) return { error: error.message };
    throw error;
  }

  await createSession(user.id, user.email, user.role);
  redirect("/admin/dashboard");
}

export async function registerDanisanAction(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const parsed = registerDanisanSchema.safeParse({
    fullName: String(formData.get("fullName") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim().toLowerCase(),
    phone: String(formData.get("phone") ?? "").trim(),
    password: String(formData.get("password") ?? ""),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Bilgileri kontrol edin." };
  }

  let user: Awaited<ReturnType<typeof authService.registerDanisan>>;
  try {
    user = await authService.registerDanisan(parsed.data);
  } catch (error) {
    if (error instanceof DomainError) return { error: error.message };
    throw error;
  }

  await createSession(user.id, user.email, user.role);
  redirect("/danisan/randevularim");
}

export async function registerPsikologAction(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const parsed = registerPsikologSchema.safeParse({
    fullName: String(formData.get("fullName") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim().toLowerCase(),
    phone: String(formData.get("phone") ?? "").trim(),
    password: String(formData.get("password") ?? ""),
    title: String(formData.get("title") ?? "").trim(),
    experienceYears: Number(formData.get("experienceYears") ?? 0),
    city: String(formData.get("city") ?? "").trim(),
    bio: String(formData.get("bio") ?? "").trim(),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Bilgileri kontrol edin." };
  }
  const licenseDocument = formData.get("licenseDocument");
  if (!(licenseDocument instanceof File) || licenseDocument.size === 0) {
    return { error: "Psikoloji lisans diplomanızı yüklemeniz gerekiyor." };
  }

  let licenseDocumentKey: string;
  try {
    const uploaded = await uploadDocument(licenseDocument, "licenses");
    licenseDocumentKey = uploaded.key;
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Diploma yüklenemedi.",
    };
  }

  let user: Awaited<ReturnType<typeof authService.registerPsikolog>>;
  try {
    user = await authService.registerPsikolog(parsed.data, { licenseDocumentKey });
  } catch (error) {
    if (error instanceof DomainError) return { error: error.message };
    throw error;
  }

  await createSession(user.id, user.email, user.role);
  redirect("/kayit/psikolog/basvuru-alindi");
}

export async function logoutAction() {
  await deleteSession();
  redirect("/");
}

export async function updateOwnAccountAction(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const session = await getOptionalSession();
  if (!session) {
    return { error: "Oturum bulunamadı." };
  }

  const fullName = String(formData.get("fullName") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();

  try {
    await authService.updateAccount(session.userId, { fullName, phone });
  } catch (error) {
    if (error instanceof DomainError) return { error: error.message };
    throw error;
  }

  return { error: undefined };
}
