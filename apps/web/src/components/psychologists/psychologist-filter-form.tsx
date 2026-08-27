"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { APPROACH_OPTIONS, GENDER_OPTIONS, LANGUAGE_OPTIONS } from "@/lib/psychologists/options";

type Specialty = { id: number; name: string; slug: string };

export function PsychologistFilterForm({ specialties }: { specialties: Specialty[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function updateParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("sayfa");
    router.push(`/psikologlar?${params.toString()}`);
  }

  return (
    <div className="flex flex-col gap-4 self-start rounded-xl border border-border bg-card p-4">
      <div className="space-y-1.5">
        <Label>Uzmanlık Alanı</Label>
        <Select
          value={searchParams.get("uzmanlik") ?? ""}
          onValueChange={(value) => updateParam("uzmanlik", value || null)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Tümü" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Tümü</SelectItem>
            {specialties.map((specialty) => (
              <SelectItem key={specialty.id} value={specialty.slug}>
                {specialty.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="sehir">Şehir</Label>
        <Input
          id="sehir"
          defaultValue={searchParams.get("sehir") ?? ""}
          onBlur={(event) => updateParam("sehir", event.target.value || null)}
          placeholder="İstanbul"
        />
      </div>

      <label className="flex items-center gap-2 text-sm">
        <Checkbox
          checked={searchParams.get("online") === "1"}
          onCheckedChange={(checked) => updateParam("online", checked ? "1" : null)}
        />
        Sadece online görüşme
      </label>

      <label className="flex items-center gap-2 text-sm">
        <Checkbox
          checked={searchParams.get("onGorusme") === "1"}
          onCheckedChange={(checked) => updateParam("onGorusme", checked ? "1" : null)}
        />
        Sadece ücretsiz ön görüşme sunanlar
      </label>

      <div className="space-y-1.5">
        <Label>Fiyat Aralığı (₺)</Label>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min={0}
            placeholder="Min"
            defaultValue={searchParams.get("minFiyat") ?? ""}
            onBlur={(event) => updateParam("minFiyat", event.target.value || null)}
          />
          <Input
            type="number"
            min={0}
            placeholder="Max"
            defaultValue={searchParams.get("maxFiyat") ?? ""}
            onBlur={(event) => updateParam("maxFiyat", event.target.value || null)}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Cinsiyet</Label>
        <Select
          value={searchParams.get("cinsiyet") ?? ""}
          onValueChange={(value) => updateParam("cinsiyet", value || null)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Farketmez" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Farketmez</SelectItem>
            {GENDER_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label>Dil</Label>
        <Select
          value={searchParams.get("dil") ?? ""}
          onValueChange={(value) => updateParam("dil", value || null)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Tümü" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Tümü</SelectItem>
            {LANGUAGE_OPTIONS.map((language) => (
              <SelectItem key={language} value={language}>
                {language}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label>Terapi Yaklaşımı</Label>
        <Select
          value={searchParams.get("yaklasim") ?? ""}
          onValueChange={(value) => updateParam("yaklasim", value || null)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Tümü" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Tümü</SelectItem>
            {APPROACH_OPTIONS.map((approach) => (
              <SelectItem key={approach} value={approach}>
                {approach}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label>Sırala</Label>
        <Select
          value={searchParams.get("sirala") ?? "yeni"}
          onValueChange={(value) => updateParam("sirala", value === "yeni" ? null : value)}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="yeni">En Yeni</SelectItem>
            <SelectItem value="fiyat_artan">Fiyat: Artan</SelectItem>
            <SelectItem value="fiyat_azalan">Fiyat: Azalan</SelectItem>
            <SelectItem value="puan">Puana Göre</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button variant="ghost" size="sm" onClick={() => router.push("/psikologlar")}>
        Filtreleri Temizle
      </Button>
    </div>
  );
}
