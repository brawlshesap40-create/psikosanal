import {
  LayoutGrid,
  CalendarCheck2,
  MessageCircle,
  PackageOpen,
  Heart,
  UserRound,
} from "lucide-react";
import { verifyDanisanSession } from "@/lib/auth/dal";
import { logoutAction } from "@/lib/auth/actions";
import { CrisisBanner } from "@/components/site/crisis-banner";
import { DashboardShell, type DashboardNavItem } from "@/components/dashboard/dashboard-shell";

const NAV_ITEMS: DashboardNavItem[] = [
  { href: "/danisan", label: "Panelim", icon: <LayoutGrid /> },
  { href: "/danisan/randevularim", label: "Randevularım", icon: <CalendarCheck2 /> },
  { href: "/danisan/mesajlar", label: "Mesajlarım", icon: <MessageCircle /> },
  { href: "/danisan/paketlerim", label: "Paketlerim", icon: <PackageOpen /> },
  { href: "/danisan/favorilerim", label: "Favorilerim", icon: <Heart /> },
  { href: "/danisan/profil", label: "Profilim", icon: <UserRound /> },
];

export default async function DanisanDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await verifyDanisanSession();

  return (
    <>
      <DashboardShell
        items={NAV_ITEMS}
        roleLabel="Danışan Paneli"
        email={session.email}
        logoutAction={logoutAction}
      >
        {children}
      </DashboardShell>
      <CrisisBanner />
    </>
  );
}
