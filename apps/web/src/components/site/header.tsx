import Link from "next/link";
import { getOptionalSession } from "@/lib/auth/dal";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/site-config";
import { NotificationBell } from "@/components/notifications/notification-bell";
import {
  countUnreadNotifications,
  getNotificationsForUser,
} from "@/lib/notifications/queries";

export async function SiteHeader() {
  const session = await getOptionalSession();
  const [notifications, unreadCount] = session
    ? await Promise.all([
        getNotificationsForUser(session.userId),
        countUnreadNotifications(session.userId),
      ])
    : [[], 0];

  return (
    <header className="border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="text-lg font-semibold text-foreground">
          {siteConfig.name}
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-muted-foreground sm:flex">
          <Link href="/psikologlar" className="hover:text-foreground">
            Psikolog Bul
          </Link>
          <Link href="/kayit/psikolog" className="hover:text-foreground">
            Psikolog Misiniz?
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          {session && (
            <NotificationBell notifications={notifications} unreadCount={unreadCount} />
          )}
          {session?.role === "danisan" && (
            <Button
              variant="outline"
              size="sm"
              nativeButton={false}
              render={<Link href="/danisan/randevularim" />}
            >
              Randevularım
            </Button>
          )}
          {session?.role === "psikolog" && (
            <Button
              variant="outline"
              size="sm"
              nativeButton={false}
              render={<Link href="/psikolog/panel" />}
            >
              Panelim
            </Button>
          )}
          {!session && (
            <>
              <Button
                variant="ghost"
                size="sm"
                nativeButton={false}
                render={<Link href="/giris" />}
              >
                Giriş Yap
              </Button>
              <Button size="sm" nativeButton={false} render={<Link href="/kayit/danisan" />}>
                Kayıt Ol
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
