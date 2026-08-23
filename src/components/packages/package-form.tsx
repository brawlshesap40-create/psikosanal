"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createPackageAction } from "@/lib/packages/actions";

export function PackageForm() {
  const [state, action, pending] = useActionState(createPackageAction, undefined);

  return (
    <form action={action} className="flex flex-wrap items-end gap-3">
      <div className="space-y-1.5">
        <Label htmlFor="name">Paket Adı</Label>
        <Input id="name" name="name" placeholder="4 Seans Paketi" required />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="sessionCount">Seans Sayısı</Label>
        <Input id="sessionCount" name="sessionCount" type="number" min={2} required />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="priceTl">Fiyat (₺)</Label>
        <Input id="priceTl" name="priceTl" type="number" min={1} required />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Ekleniyor..." : "Paket Ekle"}
      </Button>
      {state?.error && <p className="w-full text-sm text-destructive">{state.error}</p>}
    </form>
  );
}
