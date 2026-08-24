import { and, desc, eq } from "drizzle-orm";
import { db } from "@psikosanal/db";
import { notifications, notificationTypeEnum } from "@psikosanal/db/schema";

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

export async function markRead(userId: number, notificationId: number) {
  await db
    .update(notifications)
    .set({ isRead: true })
    .where(and(eq(notifications.id, notificationId), eq(notifications.userId, userId)));
}

export async function markAllRead(userId: number) {
  await db
    .update(notifications)
    .set({ isRead: true })
    .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
}

export async function getForUser(userId: number, limit = 20) {
  return db.query.notifications.findMany({
    where: eq(notifications.userId, userId),
    orderBy: [desc(notifications.createdAt)],
    limit,
  });
}

export async function countUnread(userId: number) {
  const rows = await db
    .select({ id: notifications.id })
    .from(notifications)
    .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
  return rows.length;
}
