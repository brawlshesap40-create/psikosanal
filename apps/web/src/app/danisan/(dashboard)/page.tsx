import Link from "next/link";
import { CalendarClock, Heart, PackageOpen, Sparkles, Video } from "lucide-react";
import { verifyDanisanSession } from "@/lib/auth/dal";
import { getAppointmentsForClient } from "@/lib/appointments/queries";
import { getPackagePurchasesForClient } from "@/lib/packages/queries";
import { getFavoritesForClient } from "@/lib/favorites/queries";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default async function DanisanPanelPage() {
  const session = await verifyDanisanSession();

  const [appointments, packagePurchases, favorites] = await Promise.all([
    getAppointmentsForClient(session.userId),
    getPackagePurchasesForClient(session.userId),
    getFavoritesForClient(session.userId),
  ]);

  const upcoming = appointments
    .filter((a) => a.status === "onaylandi" && a.slot.startTime > new Date())
    .sort((a, b) => a.slot.startTime.getTime() - b.slot.startTime.getTime());
  const nextAppointment = upcoming[0];
  const totalCredits = packagePurchases.reduce((sum, p) => sum + p.sessionsRemaining, 0);

  return (
    <div className="panel-glow -mx-4 px-4 pt-2 sm:-mx-6 sm:px-6">
      <h1 className="text-2xl font-semibold text-foreground">Hoş geldiniz</h1>
      <p className="mt-1 text-sm text-muted-foreground">İşte hesabınızın özeti.</p>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardContent className="flex h-full flex-col justify-between gap-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">Sıradaki Randevu</p>
              <CalendarClock className="size-4 text-muted-foreground" />
            </div>

            {nextAppointment ? (
              <div className="flex items-center gap-4">
                <Avatar size="lg">
                  <AvatarFallback>
                    {nextAppointment.psychologist?.user.fullName.slice(0, 1)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-foreground">
                    {nextAppointment.psychologist?.user.fullName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {nextAppointment.slot.startTime.toLocaleString("tr-TR", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <Button
                  size="sm"
                  className="ml-auto"
                  nativeButton={false}
                  render={<Link href={`/gorusme/${nextAppointment.id}`} />}
                >
                  <Video /> Görüşmeye Git
                </Button>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Yaklaşan bir randevunuz yok. Size uygun bir psikolog bulmak için Akıllı
                Eşleştirme&apos;yi deneyebilirsiniz.
              </p>
            )}

            <div className="flex flex-wrap gap-2 border-t border-border pt-4">
              <Button size="sm" variant="outline" nativeButton={false} render={<Link href="/psikologlar" />}>
                Psikolog Bul
              </Button>
              <Button size="sm" variant="outline" nativeButton={false} render={<Link href="/eslesme" />}>
                <Sparkles /> Akıllı Eşleştirme
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-1">
          <Link href="/danisan/randevularim">
            <Card className="card-interactive">
              <CardContent className="flex items-center gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <CalendarClock className="size-4" />
                </div>
                <div>
                  <p className="text-xl font-semibold text-foreground">{upcoming.length}</p>
                  <p className="text-xs text-muted-foreground">Yaklaşan Randevu</p>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/danisan/paketlerim">
            <Card className="card-interactive">
              <CardContent className="flex items-center gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <PackageOpen className="size-4" />
                </div>
                <div>
                  <p className="text-xl font-semibold text-foreground">{totalCredits}</p>
                  <p className="text-xs text-muted-foreground">Kalan Paket Kredisi</p>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/danisan/favorilerim">
            <Card className="card-interactive">
              <CardContent className="flex items-center gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Heart className="size-4" />
                </div>
                <div>
                  <p className="text-xl font-semibold text-foreground">{favorites.length}</p>
                  <p className="text-xs text-muted-foreground">Favori Psikolog</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>

      {upcoming.length > 1 && (
        <div className="mt-6">
          <h2 className="mb-3 text-sm font-medium text-foreground">Diğer Yaklaşan Randevular</h2>
          <div className="flex flex-col gap-2">
            {upcoming.slice(1, 5).map((appointment) => (
              <Card key={appointment.id} size="sm">
                <CardContent className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar size="sm">
                      <AvatarFallback>
                        {appointment.psychologist?.user.fullName.slice(0, 1)}
                      </AvatarFallback>
                    </Avatar>
                    <p className="text-sm font-medium text-foreground">
                      {appointment.psychologist?.user.fullName}
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {appointment.slot.startTime.toLocaleString("tr-TR", {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
