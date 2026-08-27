import Link from "next/link";
import { getOptionalSession } from "@/lib/auth/dal";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/site-config";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { Logo } from "@/components/site/logo";
import { MobileNav } from "@/components/site/mobile-nav";
import { ThemeToggle } from "@/components/site/theme-toggle";
import { HeaderScrollShell } from "@/components/site/header-scroll-shell";
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
    <HeaderScrollShell>
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" aria-label={siteConfig.name} className="rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-5 text-sm text-muted-foreground lg:flex">
          <Link href="/psikologlar" className="hover:text-foreground">
            Psikolog Bul
          </Link>
          <Link href="/eslesme" className="hover:text-foreground">
            Eşleştir
          </Link>
          <Link href="/testler" className="hover:text-foreground">
            Testler
          </Link>
          <Link href="/blog" className="hover:text-foreground">
            Blog
          </Link>
          <Link href="/kurumsal" className="hover:text-foreground">
            Kurumsal
          </Link>
          <Link href="/soru-sor" className="hover:text-foreground">
            Soru Sor
          </Link>
          <Link href="/kayit/psikolog" className="hover:text-foreground">
            Psikolog Misiniz?
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <MobileNav authed={!!session} />
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
            <div className="hidden items-center gap-2 sm:flex">
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
            </div>
          )}
        </div>
      </div>
    </HeaderScrollShell>
  );
}
