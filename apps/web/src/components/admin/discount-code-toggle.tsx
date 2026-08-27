"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { toggleDiscountCodeAction } from "@/lib/discounts/actions";

export function DiscountCodeToggle({ id, isActive }: { id: number; isActive: boolean }) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      size="sm"
      variant={isActive ? "destructive" : "default"}
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await toggleDiscountCodeAction(id, !isActive);
          toast.success(isActive ? "Kod devre dışı bırakıldı." : "Kod etkinleştirildi.");
        })
      }
    >
      {isActive ? "Devre Dışı Bırak" : "Etkinleştir"}
    </Button>
  );
}
