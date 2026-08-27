"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, CalendarDays, MessageCircle, User } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/uygulama", label: "Ana Sayfa", icon: Home },
  { href: "/uygulama/psikologlar", label: "Keşfet", icon: Compass },
  { href: "/uygulama/randevularim", label: "Randevular", icon: CalendarDays },
  { href: "/uygulama/mesajlar", label: "Mesajlar", icon: MessageCircle },
  { href: "/uygulama/profil", label: "Profil", icon: User },
] as const;

export function AppTabBar() {
  const pathname = usePathname();

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center px-4"
      style={{ paddingBottom: "max(env(safe-area-inset-bottom), 14px)" }}
    >
      <nav
        className="app-hairline app-blur-surface pointer-events-auto flex w-full max-w-md items-center gap-1 rounded-full border p-1.5 shadow-[var(--app-shadow-lg)]"
      >
        {TABS.map((tab) => {
          const active =
            tab.href === "/uygulama"
              ? pathname === "/uygulama"
              : pathname === tab.href || pathname.startsWith(`${tab.href}/`);
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "press flex h-11 flex-1 items-center justify-center gap-1.5 rounded-full text-[12px] font-semibold",
                active
                  ? "flex-[1.7] bg-brand text-brand-foreground shadow-[var(--app-shadow)]"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="size-5 shrink-0" strokeWidth={active ? 2.4 : 2} />
              {active && <span className="truncate">{tab.label}</span>}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
