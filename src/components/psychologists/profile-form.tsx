"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { updatePsychologistProfileAction } from "@/lib/psychologists/actions";
import { APPROACH_OPTIONS, GENDER_OPTIONS, LANGUAGE_OPTIONS } from "@/lib/psychologists/options";

type Specialty = { id: number; name: string };

type Profile = {
  title: string;
  bio: string | null;
  experienceYears: number | null;
  sessionPriceTl: number | null;
  city: string | null;
  onlineAvailable: boolean;
  inPersonAvailable: boolean;
  gender: string;
  languages: string[];
  approaches: string[];
  introCallEnabled: boolean;
  specialties: { specialty: Specialty }[];
};

export function ProfileForm({
  profile,
  allSpecialties,
}: {
  profile: Profile;
  allSpecialties: Specialty[];
}) {
  const [state, action, pending] = useActionState(
    updatePsychologistProfileAction,
    undefined
  );
  const selectedIds = new Set(profile.specialties.map((entry) => entry.specialty.id));
  const [gender, setGender] = useState(profile.gender);

  return (
    <form action={action} className="max-w-xl space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="title">Unvan</Label>
          <Input id="title" name="title" defaultValue={profile.title} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="city">Şehir</Label>
          <Input id="city" name="city" defaultValue={profile.city ?? ""} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="experienceYears">Deneyim (yıl)</Label>
          <Input
            id="experienceYears"
            name="experienceYears"
            type="number"
            min={0}
            defaultValue={profile.experienceYears ?? 0}
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="sessionPriceTl">Seans Ücreti (₺)</Label>
          <Input
            id="sessionPriceTl"
            name="sessionPriceTl"
            type="number"
            min={0}
            defaultValue={profile.sessionPriceTl ?? 0}
            required
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="bio">Hakkında</Label>
        <Textarea id="bio" name="bio" rows={5} defaultValue={profile.bio ?? ""} required />
      </div>

      <div className="space-y-2">
        <Label>Uzmanlık Alanları</Label>
        <div className="grid grid-cols-2 gap-2">
          {allSpecialties.map((specialty) => (
            <label key={specialty.id} className="flex items-center gap-2 text-sm">
              <Checkbox
                name="specialtyIds"
                value={String(specialty.id)}
                defaultChecked={selectedIds.has(specialty.id)}
              />
              {specialty.name}
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Konuştuğunuz Diller</Label>
        <div className="grid grid-cols-2 gap-2">
          {LANGUAGE_OPTIONS.map((language) => (
            <label key={language} className="flex items-center gap-2 text-sm">
              <Checkbox
                name="languages"
                value={language}
                defaultChecked={profile.languages.includes(language)}
              />
              {language}
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Terapi Yaklaşımları</Label>
        <div className="grid grid-cols-2 gap-2">
          {APPROACH_OPTIONS.map((approach) => (
            <label key={approach} className="flex items-center gap-2 text-sm">
              <Checkbox
                name="approaches"
                value={approach}
                defaultChecked={profile.approaches.includes(approach)}
              />
              {approach}
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Cinsiyet</Label>
        <Select value={gender} onValueChange={(value) => value && setGender(value)}>
          <SelectTrigger className="w-full sm:w-60">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {GENDER_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <input type="hidden" name="gender" value={gender} />
      </div>

      <div className="flex flex-wrap gap-4">
        <label className="flex items-center gap-2 text-sm">
          <Checkbox name="onlineAvailable" defaultChecked={profile.onlineAvailable} />
          Online görüşme
        </label>
        <label className="flex items-center gap-2 text-sm">
          <Checkbox name="inPersonAvailable" defaultChecked={profile.inPersonAvailable} />
          Yüz yüze görüşme
        </label>
        <label className="flex items-center gap-2 text-sm">
          <Checkbox name="introCallEnabled" defaultChecked={profile.introCallEnabled} />
          Ücretsiz ön görüşme sunuyorum
        </label>
      </div>

      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
      {state?.success && <p className="text-sm text-primary">Profil güncellendi.</p>}
      <Button type="submit" disabled={pending}>
        {pending ? "Kaydediliyor..." : "Kaydet"}
      </Button>
    </form>
  );
}
