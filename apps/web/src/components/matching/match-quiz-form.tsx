"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { PsychologistCard } from "@/components/psychologists/psychologist-card";
import { runMatchQuizAction } from "@/lib/matching/actions";

type Specialty = { id: number; name: string; slug: string };

export function MatchQuizForm({ specialties }: { specialties: Specialty[] }) {
  const [state, action, pending] = useActionState(runMatchQuizAction, undefined);
  const [specialtySlug, setSpecialtySlug] = useState("");
  const [genderPreference, setGenderPreference] = useState("");

  if (state?.results) {
    if (state.results.length === 0) {
      return (
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Kriterlerinize tam uyan bir psikolog bulamadık. Filtreleri gevşetip tekrar
            deneyebilir ya da tüm psikologları inceleyebilirsiniz.
          </p>
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-6">
        {state.results.map(({ candidate, reasons }) => (
          <div key={candidate.id} className="flex flex-col gap-2">
            <PsychologistCard psychologist={candidate} />
            {reasons.length > 0 && (
              <ul className="ml-1 list-disc pl-4 text-xs text-muted-foreground">
                {reasons.map((reason) => (
                  <li key={reason}>{reason}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <Card>
      <CardContent>
        <form action={action} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Aradığınız destek alanı</Label>
            <Select
              value={specialtySlug}
              onValueChange={(value) => setSpecialtySlug(value ?? "")}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Farketmez" />
              </SelectTrigger>
              <SelectContent>
                {specialties.map((specialty) => (
                  <SelectItem key={specialty.id} value={specialty.slug}>
                    {specialty.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <input type="hidden" name="specialtySlug" value={specialtySlug} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="maxBudgetTl">Seans başına en fazla bütçeniz (₺)</Label>
            <Input id="maxBudgetTl" name="maxBudgetTl" type="number" min={0} placeholder="Örn. 1000" />
          </div>

          <div className="space-y-1.5">
            <Label>Cinsiyet tercihi</Label>
            <Select
              value={genderPreference}
              onValueChange={(value) => setGenderPreference(value ?? "")}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Farketmez" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="kadin">Kadın</SelectItem>
                <SelectItem value="erkek">Erkek</SelectItem>
              </SelectContent>
            </Select>
            <input type="hidden" name="genderPreference" value={genderPreference} />
          </div>

          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <Checkbox name="wantsFreeIntro" />
            Önce ücretsiz bir ön görüşme yapmak istiyorum
          </label>

          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Eşleştiriliyor..." : "Bana Uygun Psikoloğu Bul"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
