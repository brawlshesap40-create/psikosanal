"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createDiscountCodeAction } from "@/lib/discounts/actions";

const KIND_LABEL: Record<string, string> = { yuzde: "Yüzde (%)", tutar: "Sabit Tutar (₺)" };
const APPLIES_TO_LABEL: Record<string, string> = {
  hepsi: "Hepsi",
  seans: "Sadece Seans",
  paket: "Sadece Paket",
};

export function DiscountCodeForm() {
  const [state, action, pending] = useActionState(createDiscountCodeAction, undefined);
  const [kind, setKind] = useState("yuzde");
  const [appliesTo, setAppliesTo] = useState("hepsi");

  return (
    <form action={action} className="flex flex-wrap items-end gap-3">
      <div className="space-y-1.5">
        <Label htmlFor="code">Kod</Label>
        <Input id="code" name="code" placeholder="HOSGELDIN" required className="uppercase" />
      </div>
      <div className="space-y-1.5">
        <Label>Tür</Label>
        <Select value={kind} onValueChange={(value) => value && setKind(value)}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(KIND_LABEL).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <input type="hidden" name="kind" value={kind} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="value">Değer</Label>
        <Input id="value" name="value" type="number" min={1} required />
      </div>
      <div className="space-y-1.5">
        <Label>Geçerli Olduğu İşlem</Label>
        <Select value={appliesTo} onValueChange={(value) => value && setAppliesTo(value)}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(APPLIES_TO_LABEL).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <input type="hidden" name="appliesTo" value={appliesTo} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="maxUses">Maks. Kullanım (opsiyonel)</Label>
        <Input id="maxUses" name="maxUses" type="number" min={1} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="validUntil">Son Kullanım Tarihi (opsiyonel)</Label>
        <Input id="validUntil" name="validUntil" type="date" />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Ekleniyor..." : "Kod Ekle"}
      </Button>
      {state?.error && <p className="w-full text-sm text-destructive">{state.error}</p>}
    </form>
  );
}
