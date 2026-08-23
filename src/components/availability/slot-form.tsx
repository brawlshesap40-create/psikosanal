"use client";

import { useActionState, useState } from "react";
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
import { createAvailabilitySlotAction } from "@/lib/availability/actions";

const SESSION_TYPE_OPTIONS = [
  { value: "bireysel", label: "Bireysel" },
  { value: "cift", label: "Çift Terapisi" },
  { value: "aile", label: "Aile Terapisi" },
  { value: "grup", label: "Grup Terapisi" },
];

export function SlotForm({ introCallEnabled }: { introCallEnabled: boolean }) {
  const [state, action, pending] = useActionState(createAvailabilitySlotAction, undefined);
  const [sessionType, setSessionType] = useState("bireysel");

  return (
    <form action={action} className="flex flex-wrap items-end gap-3">
      <div className="space-y-1.5">
        <Label htmlFor="startTime">Tarih ve Saat</Label>
        <Input id="startTime" name="startTime" type="datetime-local" required />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="durationMinutes">Süre (dk)</Label>
        <Input
          id="durationMinutes"
          name="durationMinutes"
          type="number"
          defaultValue={50}
          min={15}
          max={240}
          required
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="sessionType">Seans Türü</Label>
        <Select value={sessionType} onValueChange={(value) => value && setSessionType(value)}>
          <SelectTrigger id="sessionType" className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SESSION_TYPE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <input type="hidden" name="sessionType" value={sessionType} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="repeatWeeks">Kaç hafta tekrarlansın</Label>
        <Input
          id="repeatWeeks"
          name="repeatWeeks"
          type="number"
          defaultValue={1}
          min={1}
          max={12}
          required
        />
      </div>
      {introCallEnabled && (
        <label className="flex items-center gap-2 pb-2 text-sm">
          <Checkbox name="isIntro" />
          Ücretsiz ön görüşme
        </label>
      )}
      <Button type="submit" disabled={pending}>
        {pending ? "Ekleniyor..." : "Müsaitlik Ekle"}
      </Button>
      {state?.error && <p className="w-full text-sm text-destructive">{state.error}</p>}
    </form>
  );
}
