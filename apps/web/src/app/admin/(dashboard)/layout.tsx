import {
  LayoutGrid,
  FileCheck2,
  Stethoscope,
  Users,
  CalendarCheck2,
  Wallet,
  Star,
  Newspaper,
  Ticket,
  HelpCircle,
  Building2,
} from "lucide-react";
import { verifyAdminSession } from "@/lib/auth/dal";
import { logoutAction } from "@/lib/auth/actions";
import { countPendingApplications } from "@/lib/psychologists/queries";
import { getPendingReviews } from "@/lib/reviews/queries";
import { DashboardShell, type DashboardNavItem } from "@/components/dashboard/dashboard-shell";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await verifyAdminSession();
  const [pendingCount, pendingReviews] = await Promise.all([
    countPendingApplications(),
    getPendingReviews(),
  ]);

  const items: DashboardNavItem[] = [
    { href: "/admin/dashboard", label: "Özet", icon: <LayoutGrid /> },
    { href: "/admin/psikolog-basvurulari", label: "Başvurular", icon: <FileCheck2 />, badge: pendingCount || undefined },
    { href: "/admin/psikologlar", label: "Psikologlar", icon: <Stethoscope /> },
    { href: "/admin/danisanlar", label: "Danışanlar", icon: <Users /> },
    { href: "/admin/randevular", label: "Randevular", icon: <CalendarCheck2 /> },
    { href: "/admin/odemeler", label: "Ödemeler", icon: <Wallet /> },
    { href: "/admin/yorumlar", label: "Yorumlar", icon: <Star />, badge: pendingReviews.length || undefined },
    { href: "/admin/blog", label: "Blog", icon: <Newspaper /> },
    { href: "/admin/indirim-kodlari", label: "İndirim Kodları", icon: <Ticket /> },
    { href: "/admin/sorular", label: "Sorular", icon: <HelpCircle /> },
    { href: "/admin/kurumsal-talepler", label: "Kurumsal", icon: <Building2 /> },
  ];

  return (
    <DashboardShell items={items} roleLabel="Yönetim Paneli" email={session.email} logoutAction={logoutAction}>
      {children}
    </DashboardShell>
  );
}
