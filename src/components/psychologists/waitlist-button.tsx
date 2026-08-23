"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { joinWaitlistAction } from "@/lib/waitlist/actions";

export function WaitlistButton({
  psychologistId,
  slug,
  initialJoined,
}: {
  psychologistId: number;
  slug: string;
  initialJoined: boolean;
}) {
  const [joined, setJoined] = useState(initialJoined);
  const [pending, startTransition] = useTransition();

  if (joined) {
    return (
      <p className="text-sm text-muted-foreground">
        Yeni müsaitlik açıldığında size bildireceğiz.
      </p>
    );
  }

  return (
    <Button
      variant="outline"
      className="w-full"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          try {
            await joinWaitlistAction(psychologistId, slug);
            setJoined(true);
            toast.success("Bildirim listesine eklendiniz.");
          } catch {
            toast.error("İşlem gerçekleştirilemedi.");
          }
        })
      }
    >
      Müsaitlik Açılınca Bildir
    </Button>
  );
}
