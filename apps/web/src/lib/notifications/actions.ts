"use server";

import { revalidatePath } from "next/cache";
import { notificationsService } from "@psikosanal/core";
import { getOptionalSession } from "@/lib/auth/dal";

export const createNotification = notificationsService.createNotification;

export async function markNotificationReadAction(notificationId: number) {
  const session = await getOptionalSession();
  if (!session) throw new Error("Yetkisiz işlem");

  await notificationsService.markRead(session.userId, notificationId);

  revalidatePath("/", "layout");
}

export async function markAllNotificationsReadAction() {
  const session = await getOptionalSession();
  if (!session) throw new Error("Yetkisiz işlem");

  await notificationsService.markAllRead(session.userId);

  revalidatePath("/", "layout");
}
