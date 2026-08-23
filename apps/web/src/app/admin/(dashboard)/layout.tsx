import Link from "next/link";
import { verifyAdminSession } from "@/lib/auth/dal";
import { logoutAction } from "@/lib/auth/actions";
import { countPendingApplications } from "@/lib/psychologists/queries";
import { getPendingReviews } from "@/lib/reviews/queries";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-center justify-between">
        <nav className="flex items-center gap-4 text-sm font-medium text-muted-foreground">
          <Link href="/admin/dashboard" className="hover:text-foreground">
            Özet
          </Link>
          <Link
            href="/admin/psikolog-basvurulari"
            className="flex items-center gap-1.5 hover:text-foreground"
          >
            Başvurular
            {pendingCount > 0 && <Badge>{pendingCount}</Badge>}
          </Link>
          <Link href="/admin/psikologlar" className="hover:text-foreground">
            Psikologlar
          </Link>
          <Link href="/admin/danisanlar" className="hover:text-foreground">
            Danışanlar
          </Link>
          <Link href="/admin/randevular" className="hover:text-foreground">
            Randevular
          </Link>
          <Link href="/admin/odemeler" className="hover:text-foreground">
            Ödemeler
          </Link>
          <Link href="/admin/yorumlar" className="flex items-center gap-1.5 hover:text-foreground">
            Yorumlar
            {pendingReviews.length > 0 && <Badge>{pendingReviews.length}</Badge>}
          </Link>
        </nav>
        <form action={logoutAction} className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">{session.email}</span>
          <Button type="submit" variant="ghost" size="sm">
            Çıkış Yap
          </Button>
        </form>
      </div>
      {children}
    </div>
  );
}
