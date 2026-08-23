import Link from "next/link";
import { verifyDanisanSession } from "@/lib/auth/dal";
import { logoutAction } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { CrisisBanner } from "@/components/site/crisis-banner";

export default async function DanisanDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await verifyDanisanSession();

  return (
    <>
      <CrisisBanner />
      <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-center justify-between">
        <nav className="flex gap-4 text-sm font-medium text-muted-foreground">
          <Link href="/danisan/randevularim" className="hover:text-foreground">
            Randevularım
          </Link>
          <Link href="/danisan/mesajlar" className="hover:text-foreground">
            Mesajlarım
          </Link>
          <Link href="/danisan/paketlerim" className="hover:text-foreground">
            Paketlerim
          </Link>
          <Link href="/danisan/favorilerim" className="hover:text-foreground">
            Favorilerim
          </Link>
          <Link href="/danisan/profil" className="hover:text-foreground">
            Profilim
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
    </>
  );
}
