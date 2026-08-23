"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { notifications, notificationTypeEnum } from "@/lib/db/schema";
import { getOptionalSession } from "@/lib/auth/dal";

type NotificationType = (typeof notificationTypeEnum.enumValues)[number];

export async function createNotification(params: {
  userId: number;
  type: NotificationType;
  title: string;
  body?: string;
  link?: string;
}) {
  await db.insert(notifications).values(params);
}

export async function markNotificationReadAction(notificationId: number) {
  const session = await getOptionalSession();
  if (!session) throw new Error("Yetkisiz işlem");

  await db
    .update(notifications)
    .set({ isRead: true })
    .where(
      and(eq(notifications.id, notificationId), eq(notifications.userId, session.userId))
    );

  revalidatePath("/", "layout");
}

export async function markAllNotificationsReadAction() {
  const session = await getOptionalSession();
  if (!session) throw new Error("Yetkisiz işlem");

  await db
    .update(notifications)
    .set({ isRead: true })
    .where(and(eq(notifications.userId, session.userId), eq(notifications.isRead, false)));

  revalidatePath("/", "layout");
}
