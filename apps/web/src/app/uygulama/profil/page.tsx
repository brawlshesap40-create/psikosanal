import Link from "next/link";
import {
  LogOut,
  ExternalLink,
  ChevronRight,
  PackageOpen,
  Heart,
  UserRound,
  ShieldCheck,
  FileText,
  LifeBuoy,
} from "lucide-react";
import { getOptionalSession } from "@/lib/auth/dal";
import { logoutAction } from "@/lib/auth/actions";
import { AppScreen } from "@/components/app/app-screen";
import { AppGuest } from "@/components/app/app-guest";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const ROLE_LABEL: Record<string, string> = {
  danisan: "Danışan",
  psikolog: "Psikolog",
  admin: "Yönetici",
};

const GROUPS: { title: string; items: { href: string; label: string; icon: typeof Heart }[] }[] = [
  {
    title: "Hesabım",
    items: [
      { href: "/danisan/paketlerim", label: "Paketlerim", icon: PackageOpen },
      { href: "/danisan/favorilerim", label: "Favorilerim", icon: Heart },
      { href: "/danisan/profil", label: "Hesap Bilgilerim", icon: UserRound },
    ],
  },
  {
    title: "Destek & Yasal",
    items: [
      { href: "/soru-sor", label: "Yardım / Soru Sor", icon: LifeBuoy },
      { href: "/kvkk", label: "KVKK Aydınlatma Metni", icon: ShieldCheck },
      { href: "/kullanim-sartlari", label: "Kullanım Şartları", icon: FileText },
    ],
  },
];

export default async function AppProfilePage() {
  const session = await getOptionalSession();

  if (!session) {
    return (
      <AppScreen title="Profil">
        <AppGuest next="/uygulama/profil" />
      </AppScreen>
    );
  }

  const initial = session.email[0]?.toUpperCase() ?? "P";

  return (
    <AppScreen title="Profil" contentClassName="px-0">
      <div className="flex flex-col items-center gap-3 px-5 pb-2 text-center">
        <Avatar size="lg" className="size-20">
          <AvatarFallback className="bg-brand/12 text-2xl font-semibold text-brand">
            {initial}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-semibold text-foreground">{session.email}</p>
          <span className="mt-1 inline-block rounded-full bg-brand/12 px-2.5 py-0.5 text-[12px] font-semibold text-brand">
            {ROLE_LABEL[session.role] ?? session.role}
          </span>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-6 px-5">
        {GROUPS.map((group) => (
          <section key={group.title}>
            <p className="mb-2 px-1 text-[12px] font-semibold tracking-wide text-muted-foreground uppercase">
              {group.title}
            </p>
            <div className="app-list">
              {group.items.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="press flex items-center gap-3 px-4 py-3.5 hover:bg-[var(--app-bg)]"
                >
                  <span className="app-icon-tile size-9 rounded-xl">
                    <Icon className="size-[18px]" />
                  </span>
                  <span className="flex-1 text-[14px] text-foreground">{label}</span>
                  <ChevronRight className="size-4 text-muted-foreground" />
                </Link>
              ))}
            </div>
          </section>
        ))}

        <div className="app-list">
          <Link
            href="/"
            className="press flex items-center gap-3 px-4 py-3.5 hover:bg-[var(--app-bg)]"
          >
            <span className="app-icon-tile size-9 rounded-xl">
              <ExternalLink className="size-[18px]" />
            </span>
            <span className="flex-1 text-[14px] text-foreground">Web sitesine dön</span>
            <ChevronRight className="size-4 text-muted-foreground" />
          </Link>
          <form action={logoutAction}>
            <button
              type="submit"
              className="press flex w-full items-center gap-3 px-4 py-3.5 text-left hover:bg-[var(--app-bg)]"
            >
              <span className="grid size-9 place-items-center rounded-xl bg-destructive/12 text-destructive">
                <LogOut className="size-[18px]" />
              </span>
              <span className="flex-1 text-[14px] font-medium text-destructive">Çıkış Yap</span>
            </button>
          </form>
        </div>

        <p className="pb-2 text-center text-[11px] text-muted-foreground">
          Psikosanal · sürüm 1.0
        </p>
      </div>
    </AppScreen>
  );
}
