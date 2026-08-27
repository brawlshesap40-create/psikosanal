import Link from "next/link";
import {
  CalendarClock,
  CalendarCheck2,
  CheckCircle2,
  Clock,
  PlusCircle,
  Sparkles,
} from "lucide-react";
import { verifyPsikologSession } from "@/lib/auth/dal";
import { getPsychologistByUserId } from "@/lib/psychologists/queries";
import { getSlotsForPsychologist } from "@/lib/availability/queries";
import { getAppointmentsForPsychologist } from "@/lib/appointments/queries";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default async function PsikologPanelPage() {
  const session = await verifyPsikologSession();
  const profile = await getPsychologistByUserId(session.userId);
  if (!profile) return null;

  const [slots, appointments] = await Promise.all([
    getSlotsForPsychologist(profile.id),
    getAppointmentsForPsychologist(profile.id),
  ]);

  const upcoming = appointments
    .filter((a) => a.status === "onaylandi" && a.slot.startTime > new Date())
    .sort((a, b) => a.slot.startTime.getTime() - b.slot.startTime.getTime());
  const completed = appointments.filter((a) => a.status === "tamamlandi").length;
  const openSlots = slots.filter((s) => s.status === "musait").length;
  const nextAppointment = upcoming[0];

  return (
    <div className="panel-glow -mx-4 px-4 pt-2 sm:-mx-6 sm:px-6">
      <h1 className="text-2xl font-semibold text-foreground">
        Hoş geldiniz, {profile.title}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">İşte bugünün özeti.</p>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardContent className="flex h-full flex-col justify-between gap-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">Sıradaki Randevu</p>
              <Clock className="size-4 text-muted-foreground" />
            </div>

            {nextAppointment ? (
              <div className="flex items-center gap-4">
                <Avatar size="lg">
                  <AvatarFallback>{nextAppointment.client.fullName.slice(0, 1)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-foreground">{nextAppointment.client.fullName}</p>
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
                  Görüşmeye Git
                </Button>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Yaklaşan bir randevunuz yok. Müsaitlik ekleyerek yeni randevu almaya açık
                olabilirsiniz.
              </p>
            )}

            <div className="flex flex-wrap gap-2 border-t border-border pt-4">
              <Button size="sm" variant="outline" nativeButton={false} render={<Link href="/psikolog/musaitlik" />}>
                <PlusCircle /> Müsaitlik Ekle
              </Button>
              <Button size="sm" variant="outline" nativeButton={false} render={<Link href="/psikolog/paketler" />}>
                <PlusCircle /> Paket Oluştur
              </Button>
              <Button size="sm" variant="outline" nativeButton={false} render={<Link href="/psikolog/sorular" />}>
                <Sparkles /> Soruları Cevapla
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-1">
          <Card>
            <CardContent className="flex items-center gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <CalendarCheck2 className="size-4" />
              </div>
              <div>
                <p className="text-xl font-semibold text-foreground">{upcoming.length}</p>
                <p className="text-xs text-muted-foreground">Yaklaşan Randevu</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <CheckCircle2 className="size-4" />
              </div>
              <div>
                <p className="text-xl font-semibold text-foreground">{completed}</p>
                <p className="text-xs text-muted-foreground">Tamamlanan Seans</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <CalendarClock className="size-4" />
              </div>
              <div>
                <p className="text-xl font-semibold text-foreground">{openSlots}</p>
                <p className="text-xs text-muted-foreground">Açık Müsaitlik</p>
              </div>
            </CardContent>
          </Card>
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
                      <AvatarFallback>{appointment.client.fullName.slice(0, 1)}</AvatarFallback>
                    </Avatar>
                    <p className="text-sm font-medium text-foreground">
                      {appointment.client.fullName}
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
