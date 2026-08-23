"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { deleteAvailabilitySlotAction } from "@/lib/availability/actions";

const STATUS_LABEL: Record<string, string> = {
  musait: "Müsait",
  dolu: "Dolu",
  pasif: "Pasif",
};

const SESSION_TYPE_LABEL: Record<string, string> = {
  bireysel: "Bireysel",
  cift: "Çift",
  aile: "Aile",
  grup: "Grup",
};

type Slot = {
  id: number;
  startTime: Date;
  durationMinutes: number;
  status: string;
  sessionType: string;
  isIntro: boolean;
};

export function SlotList({ slots }: { slots: Slot[] }) {
  const [pending, startTransition] = useTransition();

  if (slots.length === 0) {
    return <p className="text-sm text-muted-foreground">Henüz müsaitlik eklemediniz.</p>;
  }

  function handleDelete(id: number) {
    startTransition(async () => {
      try {
        await deleteAvailabilitySlotAction(id);
        toast.success("Müsaitlik silindi.");
      } catch {
        toast.error("Silinemedi.");
      }
    });
  }

  return (
    <div className="flex flex-col gap-2">
      {slots.map((slot) => (
        <div
          key={slot.id}
          className="flex items-center justify-between rounded-lg border border-border px-4 py-2.5"
        >
          <span className="text-sm text-foreground">
            {new Date(slot.startTime).toLocaleString("tr-TR", {
              weekday: "short",
              day: "numeric",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            })}{" "}
            · {slot.durationMinutes} dk
            {slot.sessionType !== "bireysel" && ` · ${SESSION_TYPE_LABEL[slot.sessionType]}`}
            {slot.isIntro && " · Ücretsiz Ön Görüşme"}
          </span>
          <div className="flex items-center gap-2">
            <Badge variant={slot.status === "musait" ? "secondary" : "outline"}>
              {STATUS_LABEL[slot.status] ?? slot.status}
            </Badge>
            {slot.status === "musait" && (
              <Button
                size="sm"
                variant="ghost"
                disabled={pending}
                onClick={() => handleDelete(slot.id)}
              >
                Sil
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
