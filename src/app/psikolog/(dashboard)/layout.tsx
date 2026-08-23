import Link from "next/link";
import { verifyPsikologSession } from "@/lib/auth/dal";
import { logoutAction } from "@/lib/auth/actions";
import { getPsychologistByUserId } from "@/lib/psychologists/queries";
import { Button } from "@/components/ui/button";

export default async function PsikologDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await verifyPsikologSession();
  const profile = await getPsychologistByUserId(session.userId);

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-center justify-between">
        <nav className="flex gap-4 text-sm font-medium text-muted-foreground">
          <Link href="/psikolog/panel" className="hover:text-foreground">
            Panelim
          </Link>
          <Link href="/psikolog/musaitlik" className="hover:text-foreground">
            Müsaitlik
          </Link>
          <Link href="/psikolog/randevularim" className="hover:text-foreground">
            Randevularım
          </Link>
          <Link href="/psikolog/mesajlar" className="hover:text-foreground">
            Mesajlarım
          </Link>
          <Link href="/psikolog/paketler" className="hover:text-foreground">
            Paketler
          </Link>
          <Link href="/psikolog/profil" className="hover:text-foreground">
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

      {profile?.approvalStatus === "beklemede" && (
        <div className="mb-6 rounded-lg border border-border bg-muted px-4 py-3 text-sm text-muted-foreground">
          Başvurunuz henüz onaylanmadı. Onaylandıktan sonra profiliniz
          danışanlara görünür olacak.
        </div>
      )}
      {profile?.approvalStatus === "reddedildi" && (
        <div className="mb-6 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          Başvurunuz reddedildi.{" "}
          {profile.adminNote && <span>Not: {profile.adminNote}</span>}
        </div>
      )}

      {children}
    </div>
  );
}
