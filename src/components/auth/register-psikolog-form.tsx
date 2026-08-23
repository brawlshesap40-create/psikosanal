"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { registerPsikologAction } from "@/lib/auth/actions";

export function RegisterPsikologForm() {
  const [state, action, pending] = useActionState(registerPsikologAction, undefined);

  return (
    <form action={action} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="fullName">Ad Soyad</Label>
          <Input id="fullName" name="fullName" required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="title">Unvan</Label>
          <Input id="title" name="title" placeholder="Klinik Psikolog" required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">E-posta</Label>
          <Input id="email" name="email" type="email" required autoComplete="username" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="phone">Telefon</Label>
          <Input id="phone" name="phone" type="tel" required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="city">Şehir</Label>
          <Input id="city" name="city" required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="experienceYears">Deneyim (yıl)</Label>
          <Input id="experienceYears" name="experienceYears" type="number" min={0} required />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="password">Şifre</Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="new-password"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="bio">Kendinizden Bahsedin</Label>
        <Textarea id="bio" name="bio" rows={4} required />
      </div>
      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Başvuru gönderiliyor..." : "Başvuruyu Gönder"}
      </Button>
    </form>
  );
}
