import {
  LayoutGrid,
  CalendarClock,
  CalendarCheck2,
  MessageCircle,
  PackageOpen,
  HelpCircle,
  UserRound,
} from "lucide-react";
import { verifyPsikologSession } from "@/lib/auth/dal";
import { logoutAction } from "@/lib/auth/actions";
import { getPsychologistByUserId } from "@/lib/psychologists/queries";
import { DashboardShell, type DashboardNavItem } from "@/components/dashboard/dashboard-shell";

const NAV_ITEMS: DashboardNavItem[] = [
  { href: "/psikolog/panel", label: "Panelim", icon: <LayoutGrid /> },
  { href: "/psikolog/musaitlik", label: "Müsaitlik", icon: <CalendarClock /> },
  { href: "/psikolog/randevularim", label: "Randevularım", icon: <CalendarCheck2 /> },
  { href: "/psikolog/mesajlar", label: "Mesajlarım", icon: <MessageCircle /> },
  { href: "/psikolog/paketler", label: "Paketler", icon: <PackageOpen /> },
  { href: "/psikolog/sorular", label: "Sorular", icon: <HelpCircle /> },
  { href: "/psikolog/profil", label: "Profilim", icon: <UserRound /> },
];

export default async function PsikologDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await verifyPsikologSession();
  const profile = await getPsychologistByUserId(session.userId);

  const banner =
    profile?.approvalStatus === "beklemede" ? (
      <div className="mb-6 rounded-xl border border-border bg-muted px-4 py-3 text-sm text-muted-foreground">
        Başvurunuz henüz onaylanmadı. Onaylandıktan sonra profiliniz danışanlara görünür olacak.
      </div>
    ) : profile?.approvalStatus === "reddedildi" ? (
      <div className="mb-6 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
        Başvurunuz reddedildi. {profile.adminNote && <span>Not: {profile.adminNote}</span>}
      </div>
    ) : null;

  return (
    <DashboardShell
      items={NAV_ITEMS}
      roleLabel="Psikolog Paneli"
      email={session.email}
      logoutAction={logoutAction}
      banner={banner}
    >
      {children}
    </DashboardShell>
  );
}
