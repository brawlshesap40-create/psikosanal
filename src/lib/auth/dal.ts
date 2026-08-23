import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { decrypt, type SessionPayload } from "./session";

export const getOptionalSession = cache(async () => {
  const cookieStore = await cookies();
  const cookie = cookieStore.get("session")?.value;
  return decrypt(cookie);
});

async function verifyRole(
  role: SessionPayload["role"],
  loginPath: string
): Promise<SessionPayload> {
  const session = await getOptionalSession();

  if (!session || session.role !== role) {
    redirect(loginPath);
  }

  return session;
}

export async function verifyDanisanSession() {
  return verifyRole("danisan", "/giris");
}

export async function verifyPsikologSession() {
  return verifyRole("psikolog", "/giris");
}

export async function verifyAdminSession() {
  return verifyRole("admin", "/admin/login");
}
