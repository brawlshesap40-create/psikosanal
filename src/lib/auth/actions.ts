"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { psychologistProfiles, users } from "@/lib/db/schema";
import { generatePsychologistSlug } from "@/lib/psychologists/slug";
import { uploadDocument } from "@/lib/storage/upload";
import {
  loginSchema,
  registerDanisanSchema,
  registerPsikologSchema,
} from "@/lib/validation/auth";
import { hashPassword, verifyPassword } from "./password";
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
  const { email, password } = parsed.data;
  const next = String(formData.get("next") ?? "");

  const user = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (!user || user.role === "admin") {
    return { error: "E-posta veya şifre hatalı." };
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return { error: "E-posta veya şifre hatalı." };
  }

  if (!user.isActive) {
    return { error: "Hesabınız devre dışı bırakılmış. Lütfen bizimle iletişime geçin." };
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
  const { email, password } = parsed.data;

  const admin = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (!admin || admin.role !== "admin") {
    return { error: "E-posta veya şifre hatalı." };
  }

  const valid = await verifyPassword(password, admin.passwordHash);
  if (!valid) {
    return { error: "E-posta veya şifre hatalı." };
  }

  await createSession(admin.id, admin.email, admin.role);
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
  const { fullName, email, phone, password } = parsed.data;

  const existing = await db.query.users.findFirst({
    where: eq(users.email, email),
  });
  if (existing) {
    return { error: "Bu e-posta adresi zaten kayıtlı." };
  }

  const passwordHash = await hashPassword(password);
  const [user] = await db
    .insert(users)
    .values({ email, passwordHash, role: "danisan", fullName, phone })
    .returning();

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
  const { fullName, email, phone, password, title, experienceYears, city, bio } =
    parsed.data;

  const licenseDocument = formData.get("licenseDocument");
  if (!(licenseDocument instanceof File) || licenseDocument.size === 0) {
    return { error: "Psikoloji lisans diplomanızı yüklemeniz gerekiyor." };
  }

  const existing = await db.query.users.findFirst({
    where: eq(users.email, email),
  });
  if (existing) {
    return { error: "Bu e-posta adresi zaten kayıtlı." };
  }

  let licenseDocumentUrl: string;
  try {
    const uploaded = await uploadDocument(licenseDocument, "licenses");
    licenseDocumentUrl = uploaded.url;
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Diploma yüklenemedi.",
    };
  }

  const passwordHash = await hashPassword(password);
  const slug = await generatePsychologistSlug(fullName);

  const user = await db.transaction(async (tx) => {
    const [newUser] = await tx
      .insert(users)
      .values({ email, passwordHash, role: "psikolog", fullName, phone })
      .returning();

    await tx.insert(psychologistProfiles).values({
      userId: newUser.id,
      slug,
      title,
      experienceYears,
      city,
      bio,
      licenseDocumentUrl,
    });

    return newUser;
  });

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

  if (fullName.length < 2) {
    return { error: "Ad soyad gereklidir." };
  }

  await db
    .update(users)
    .set({ fullName, phone: phone || null })
    .where(eq(users.id, session.userId));

  return { error: undefined };
}
