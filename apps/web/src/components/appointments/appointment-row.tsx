"use client";

import { useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ReviewDialog } from "@/components/reviews/review-dialog";
import { useNow } from "@/lib/use-now";
import {
  cancelAppointmentAction,
  markAppointmentCompletedAction,
  markNoShowAction,
} from "@/lib/appointments/actions";
import { CANCELLATION_WINDOW_HOURS } from "@/lib/appointments/constants";

const SESSION_TYPE_LABEL: Record<string, string> = {
  bireysel: "Bireysel",
  cift: "Çift Terapisi",
  aile: "Aile Terapisi",
  grup: "Grup Terapisi",
};

const STATUS_LABEL: Record<string, string> = {
  onaylandi: "Onaylandı",
  tamamlandi: "Tamamlandı",
  iptal_edildi: "İptal Edildi",
};

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive"> = {
  onaylandi: "default",
  tamamlandi: "secondary",
  iptal_edildi: "destructive",
};

type AppointmentRowProps = {
  viewer: "danisan" | "psikolog";
  appointment: {
    id: number;
    status: string;
    clientId: number;
    psychologistId: number;
    clientNote: string | null;
    sessionType?: string;
    isIntro?: boolean;
    slot: { startTime: Date; durationMinutes: number };
    psychologist?: { slug: string; user: { fullName: string } };
    client?: { fullName: string; phone: string | null };
    review?: { id: number } | null;
  };
};

export function AppointmentRow({ appointment, viewer }: AppointmentRowProps) {
  const [pending, startTransition] = useTransition();

  const counterpartName =
    viewer === "danisan"
      ? appointment.psychologist?.user.fullName
      : appointment.client?.fullName;

  const startTime = new Date(appointment.slot.startTime);
  const date = startTime.toLocaleString("tr-TR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });

  const now = useNow();
  const hoursUntilStart = (startTime.getTime() - now) / (1000 * 60 * 60);
  const cancelBlocked = viewer === "danisan" && hoursUntilStart < CANCELLATION_WINDOW_HOURS;
  const isPast = hoursUntilStart < 0;

  function handleCancel() {
    startTransition(async () => {
      const result = await cancelAppointmentAction(appointment.id);
      if (result.error) toast.error(result.error);
      else toast.success("Randevu iptal edildi.");
    });
  }

  function handleComplete() {
    startTransition(async () => {
      const result = await markAppointmentCompletedAction(appointment.id);
      if (result?.error) toast.error(result.error);
      else toast.success("Randevu tamamlandı olarak işaretlendi.");
    });
  }

  function handleNoShow() {
    startTransition(async () => {
      const result = await markNoShowAction(appointment.id, "danisan");
      if (result.error) toast.error(result.error);
      else toast.success("Danışan gelmedi olarak işaretlendi.");
    });
  }

  return (
    <Card className="transition-shadow duration-200 hover:shadow-md">
      <CardContent className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <Avatar className="mt-0.5">
            <AvatarFallback>{counterpartName?.slice(0, 1)}</AvatarFallback>
          </Avatar>
          <div>
          <p className="font-medium text-foreground">{counterpartName}</p>
          <p className="text-sm text-muted-foreground">{date}</p>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {appointment.sessionType && appointment.sessionType !== "bireysel" && (
              <Badge variant="secondary">{SESSION_TYPE_LABEL[appointment.sessionType]}</Badge>
            )}
            {appointment.isIntro && <Badge variant="secondary">Ücretsiz Ön Görüşme</Badge>}
          </div>
          {appointment.clientNote && (
            <p className="mt-1 text-sm text-muted-foreground">
              Not: {appointment.clientNote}
            </p>
          )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={STATUS_VARIANT[appointment.status] ?? "secondary"}>
            {STATUS_LABEL[appointment.status] ?? appointment.status}
          </Badge>
          {appointment.status === "onaylandi" && (
            <>
              <Button size="sm" variant="outline" render={<Link href={`/gorusme/${appointment.id}`} />}>
                Görüşmeye Katıl
              </Button>
              <Button
                size="sm"
                variant="outline"
                render={<Link href={`/api/appointments/${appointment.id}/ics`} />}
              >
                Takvime Ekle
              </Button>
              <Button
                size="sm"
                variant="outline"
                render={
                  <Link
                    href={
                      viewer === "danisan"
                        ? `/danisan/mesajlar/${appointment.psychologistId}`
                        : `/psikolog/mesajlar/${appointment.clientId}`
                    }
                  />
                }
              >
                Mesaj
              </Button>
              {viewer === "psikolog" && (
                <>
                  <Button size="sm" variant="outline" onClick={handleComplete} disabled={pending}>
                    Tamamlandı
                  </Button>
                  {isPast && (
                    <Button size="sm" variant="outline" onClick={handleNoShow} disabled={pending}>
                      Danışan Gelmedi
                    </Button>
                  )}
                </>
              )}
              <Button
                size="sm"
                variant="destructive"
                onClick={handleCancel}
                disabled={pending || cancelBlocked}
                title={
                  cancelBlocked
                    ? `Randevuya ${CANCELLATION_WINDOW_HOURS} saatten az kaldığı için iptal edilemez`
                    : undefined
                }
              >
                İptal Et
              </Button>
            </>
          )}
          {appointment.status === "tamamlandi" &&
            viewer === "danisan" &&
            !appointment.review && <ReviewDialog appointmentId={appointment.id} />}
          {appointment.status === "tamamlandi" && appointment.review && (
            <Badge variant="secondary">Değerlendirildi</Badge>
          )}
          {viewer === "danisan" &&
            appointment.psychologist &&
            (appointment.status === "tamamlandi" || appointment.status === "iptal_edildi") && (
              <Button
                size="sm"
                variant="outline"
                render={<Link href={`/psikologlar/${appointment.psychologist.slug}`} />}
              >
                Tekrar Randevu Al
              </Button>
            )}
        </div>
      </CardContent>
    </Card>
  );
}
