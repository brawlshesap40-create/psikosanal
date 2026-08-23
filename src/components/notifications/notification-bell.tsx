"use client";

import Link from "next/link";
import { Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  markAllNotificationsReadAction,
  markNotificationReadAction,
} from "@/lib/notifications/actions";

type NotificationItem = {
  id: number;
  title: string;
  body: string | null;
  link: string | null;
  isRead: boolean;
  createdAt: Date;
};

export function NotificationBell({
  notifications,
  unreadCount,
}: {
  notifications: NotificationItem[];
  unreadCount: number;
}) {
  return (
    <details className="group relative">
      <summary className="flex h-9 w-9 cursor-pointer list-none items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground [&::-webkit-details-marker]:hidden">
        <Bell className="size-5" />
        {unreadCount > 0 && (
          <span className="absolute right-0.5 top-0.5 flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </summary>

      <div className="absolute right-0 z-50 mt-2 w-80 rounded-xl border border-border bg-card p-2 shadow-lg">
        <div className="flex items-center justify-between px-2 py-1.5">
          <p className="text-sm font-medium text-foreground">Bildirimler</p>
          {unreadCount > 0 && (
            <form action={markAllNotificationsReadAction}>
              <button
                type="submit"
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Tümünü okundu işaretle
              </button>
            </form>
          )}
        </div>

        <div className="max-h-96 overflow-y-auto">
          {notifications.length === 0 && (
            <p className="px-2 py-4 text-center text-sm text-muted-foreground">
              Henüz bildiriminiz yok.
            </p>
          )}
          {notifications.map((notification) => (
            <NotificationRow key={notification.id} notification={notification} />
          ))}
        </div>
      </div>
    </details>
  );
}

function NotificationRow({ notification }: { notification: NotificationItem }) {
  const content = (
    <div
      className={cn(
        "rounded-lg px-2 py-2 text-sm hover:bg-muted",
        !notification.isRead && "bg-primary/5"
      )}
    >
      <p className="font-medium text-foreground">{notification.title}</p>
      {notification.body && (
        <p className="mt-0.5 text-xs text-muted-foreground">{notification.body}</p>
      )}
    </div>
  );

  const markRead = markNotificationReadAction.bind(null, notification.id);

  return (
    <form action={markRead}>
      {notification.link ? (
        <Link href={notification.link} className="block">
          {content}
        </Link>
      ) : (
        content
      )}
      {!notification.isRead && (
        <button type="submit" className="sr-only">
          Okundu işaretle
        </button>
      )}
    </form>
  );
}
