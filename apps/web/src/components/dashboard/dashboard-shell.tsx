"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { siteConfig } from "@/lib/site-config";
import { Logo } from "@/components/site/logo";

const FOOTER_LINKS = [
  { href: "/kvkk", label: "KVKK" },
  { href: "/gizlilik", label: "Gizlilik" },
  { href: "/kullanim-sartlari", label: "Kullanım Şartları" },
];

export type DashboardNavItem = {
  href: string;
  label: string;
  icon: ReactNode;
  badge?: number;
};

function NavLinks({
  items,
  pathname,
  onNavigate,
}: {
  items: DashboardNavItem[];
  pathname: string;
  onNavigate?: () => void;
}) {
  const activeHref = items
    .map((item) => item.href)
    .filter((href) => pathname === href || pathname.startsWith(`${href}/`))
    .sort((a, b) => b.length - a.length)[0];

  return (
    <nav className="flex flex-col gap-0.5">
      {items.map((item) => {
        const active = item.href === activeHref;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <span className="[&_svg]:size-4 [&_svg]:shrink-0">{item.icon}</span>
            <span className="flex-1">{item.label}</span>
            {Boolean(item.badge) && <Badge>{item.badge}</Badge>}
          </Link>
        );
      })}
    </nav>
  );
}

export function DashboardShell({
  items,
  roleLabel,
  email,
  logoutAction,
  banner,
  children,
}: {
  items: DashboardNavItem[];
  roleLabel: string;
  email: string;
  logoutAction: () => void | Promise<void>;
  banner?: ReactNode;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Link href="/" aria-label={siteConfig.name}>
              <Logo />
            </Link>
            <span className="hidden border-l border-border pl-3 text-xs text-muted-foreground sm:inline">
              {roleLabel}
            </span>
          </div>
          <div className="flex items-center gap-1 sm:gap-3">
            <Link
              href="/"
              className="hidden text-sm text-muted-foreground hover:text-foreground sm:inline"
            >
              Siteye dön
            </Link>
            <form action={logoutAction}>
              <Button type="submit" variant="ghost" size="sm" className="gap-2">
                <LogOut className="size-4" />
                <span className="hidden sm:inline">Çıkış Yap</span>
              </Button>
            </form>
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-7xl flex-1 gap-8 px-4 py-6 sm:px-6">
      <aside className="hidden w-56 shrink-0 lg:block">
        <div className="sticky top-20 flex flex-col gap-6">
          <div>
            <Link href="/" className="text-base font-semibold text-foreground">
              {siteConfig.name}
            </Link>
            <p className="mt-0.5 text-xs text-muted-foreground">{roleLabel}</p>
          </div>
          <NavLinks items={items} pathname={pathname} />
          <div className="mt-auto border-t border-border pt-4">
            <p className="truncate text-xs text-muted-foreground">{email}</p>
            <form action={logoutAction} className="mt-2">
              <Button type="submit" variant="ghost" size="sm" className="w-full justify-start gap-2 px-2">
                <LogOut className="size-4" />
                Çıkış Yap
              </Button>
            </form>
          </div>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <div className="mb-4 flex items-center justify-between lg:hidden">
          <p className="text-sm font-medium text-foreground">{roleLabel}</p>
          <Dialog open={mobileOpen} onOpenChange={setMobileOpen}>
            <DialogTrigger render={<Button variant="outline" size="icon" />}>
              <Menu />
              <span className="sr-only">Menü</span>
            </DialogTrigger>
            <DialogContent>
              <DialogTitle>{roleLabel}</DialogTitle>
              <NavLinks items={items} pathname={pathname} onNavigate={() => setMobileOpen(false)} />
              <div className="border-t border-border pt-3">
                <p className="truncate text-xs text-muted-foreground">{email}</p>
                <form action={logoutAction} className="mt-2">
                  <Button type="submit" variant="ghost" size="sm" className="w-full justify-start gap-2 px-2">
                    <LogOut className="size-4" />
                    Çıkış Yap
                  </Button>
                </form>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {banner}
        {children}
      </div>
      </div>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>
            © {new Date().getFullYear()} {siteConfig.name}. Tüm hakları saklıdır.
          </p>
          <div className="flex gap-4">
            {FOOTER_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="hover:text-foreground">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
