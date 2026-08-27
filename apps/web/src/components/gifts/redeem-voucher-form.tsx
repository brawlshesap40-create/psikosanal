"use client";

import { useActionState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { redeemGiftVoucherAction } from "@/lib/gifts/actions";

export function RedeemVoucherForm() {
  const [state, action, pending] = useActionState(redeemGiftVoucherAction, undefined);

  if (state?.success) {
    return (
      <div className="flex flex-col items-center gap-2 py-4 text-center">
        <CheckCircle2 className="size-10 text-primary" />
        <p className="text-sm text-foreground">
          Hediye paketiniz hesabınıza tanımlandı. Paketlerim sayfasından görebilirsiniz.
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor="code">Hediye Kodu</Label>
        <Input id="code" name="code" placeholder="Örn. A1B2C3D4E5" className="uppercase" required />
      </div>
      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Kontrol ediliyor..." : "Kodu Kullan"}
      </Button>
    </form>
  );
}
