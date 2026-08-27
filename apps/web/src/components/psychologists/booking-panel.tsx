"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { initiateBookingAction } from "@/lib/payments/actions";
import { IyzicoEmbed } from "@/components/payments/iyzico-embed";

type Slot = {
  id: number;
  startTime: string;
  durationMinutes: number;
  sessionType: string;
  isIntro: boolean;
};

const SESSION_TYPE_LABEL: Record<string, string> = {
  bireysel: "Bireysel",
  cift: "Çift Terapisi",
  aile: "Aile Terapisi",
  grup: "Grup Terapisi",
};

function formatSlot(slot: Slot) {
  const date = new Date(slot.startTime);
  const base = date.toLocaleString("tr-TR", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
  const suffix = slot.isIntro
    ? " · Ücretsiz Ön Görüşme"
    : slot.sessionType !== "bireysel"
      ? ` · ${SESSION_TYPE_LABEL[slot.sessionType]}`
      : "";
  return base + suffix;
}

export function BookingPanel({
  slots,
  isAuthenticated,
  isDanisan,
  nextPath,
}: {
  slots: Slot[];
  isAuthenticated: boolean;
  isDanisan: boolean;
  nextPath: string;
}) {
  const [selectedSlotId, setSelectedSlotId] = useState<string>("");
  const [state, action, pending] = useActionState(initiateBookingAction, undefined);

  if (state?.checkoutFormContent) {
    return (
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          Ödemenizi tamamlayarak randevunuzu onaylayın.
        </p>
        <IyzicoEmbed checkoutFormContent={state.checkoutFormContent} />
      </div>
    );
  }

  if (slots.length === 0) {
    return <p className="text-sm text-muted-foreground">Şu anda müsait randevu saati yok.</p>;
  }

  if (!isAuthenticated) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Randevu almak için giriş yapmanız gerekiyor.
        </p>
        <Button
          className="w-full"
          nativeButton={false}
          render={<Link href={`/giris?next=${encodeURIComponent(nextPath)}`} />}
        >
          Giriş Yap
        </Button>
      </div>
    );
  }

  if (!isDanisan) {
    return (
      <p className="text-sm text-muted-foreground">
        Randevu almak için danışan hesabı gerekir.
      </p>
    );
  }

  return (
    <form action={action} className="space-y-3">
      <div className="space-y-1.5">
        <Label>Müsait Saatler</Label>
        <Select
          value={selectedSlotId}
          onValueChange={(value) => setSelectedSlotId(value ?? "")}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Bir saat seçin">
              {(value: string | null) => {
                const slot = slots.find((s) => String(s.id) === value);
                return slot ? formatSlot(slot) : "Bir saat seçin";
              }}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {slots.map((slot) => (
              <SelectItem key={slot.id} value={String(slot.id)}>
                {formatSlot(slot)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <input type="hidden" name="slotId" value={selectedSlotId} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="clientNote">Not (opsiyonel)</Label>
        <Textarea id="clientNote" name="clientNote" rows={3} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="discountCode">İndirim Kodu (opsiyonel)</Label>
        <Input id="discountCode" name="discountCode" placeholder="Örn. HOSGELDIN" className="uppercase" />
      </div>

      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}

      <Button type="submit" className="w-full" disabled={pending || !selectedSlotId}>
        {pending ? "Gönderiliyor..." : "Randevu Al"}
      </Button>
    </form>
  );
}
