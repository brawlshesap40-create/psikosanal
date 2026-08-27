"use client";

import { useActionState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitCorporateLeadAction } from "@/lib/corporate/actions";

export function CorporateLeadForm() {
  const [state, action, pending] = useActionState(submitCorporateLeadAction, undefined);

  if (state?.success) {
    return (
      <div className="flex flex-col items-center gap-2 py-4 text-center">
        <CheckCircle2 className="size-10 text-primary" />
        <p className="text-sm text-foreground">
          Talebiniz alındı. Ekibimiz en kısa sürede sizinle iletişime geçecek.
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="companyName">Şirket Adı</Label>
          <Input id="companyName" name="companyName" required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="contactName">Yetkili Adı</Label>
          <Input id="contactName" name="contactName" required />
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="email">E-posta</Label>
          <Input id="email" name="email" type="email" required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="phone">Telefon (opsiyonel)</Label>
          <Input id="phone" name="phone" />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="employeeCountRange">Çalışan Sayısı (opsiyonel)</Label>
        <Input id="employeeCountRange" name="employeeCountRange" placeholder="Örn. 50-100" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="message">Mesajınız (opsiyonel)</Label>
        <Textarea id="message" name="message" rows={3} />
      </div>

      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}

      <Button type="submit" disabled={pending}>
        {pending ? "Gönderiliyor..." : "Teklif İste"}
      </Button>
    </form>
  );
}
