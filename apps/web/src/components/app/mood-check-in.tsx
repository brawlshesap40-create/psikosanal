"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const MOODS = [
  { key: "cok-iyi", emoji: "😄", label: "Çok iyi" },
  { key: "iyi", emoji: "🙂", label: "İyi" },
  { key: "orta", emoji: "😐", label: "Orta" },
  { key: "kotu", emoji: "😔", label: "Kötü" },
  { key: "cok-kotu", emoji: "😣", label: "Çok kötü" },
] as const;

const STORAGE_KEY = "psikosanal-mood";

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function readStoredMood(): string | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { date: string; mood: string };
    return parsed.date === todayKey() ? parsed.mood : null;
  } catch {
    return null;
  }
}

export function MoodCheckIn() {
  const [state, setState] = useState<{ mounted: boolean; mood: string | null }>({
    mounted: false,
    mood: null,
  });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- saklanan değer yalnızca client'ta bilinir; hidrasyon güvenli tek okuma
    setState({ mounted: true, mood: readStoredMood() });
  }, []);

  function pick(mood: string) {
    setState((s) => ({ ...s, mood: mood || null }));
    try {
      if (mood) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: todayKey(), mood }));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      /* yok say */
    }
  }

  if (!state.mounted) return <div className="app-card h-[104px]" />;

  const chosen = MOODS.find((m) => m.key === state.mood);

  return (
    <div className="app-card p-4">
      <p className="text-[14px] font-semibold text-foreground">
        {chosen ? "Bugünkü ruh halin kaydedildi" : "Bugün nasıl hissediyorsun?"}
      </p>
      {chosen ? (
        <div className="mt-3 flex items-center gap-3">
          <span className="text-3xl">{chosen.emoji}</span>
          <div>
            <p className="text-[13px] font-medium text-foreground">{chosen.label}</p>
            <button onClick={() => pick("")} className="text-[12px] text-brand" type="button">
              Değiştir
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-3 flex justify-between">
          {MOODS.map((m) => (
            <button
              key={m.key}
              type="button"
              onClick={() => pick(m.key)}
              className={cn(
                "press flex flex-col items-center gap-1 rounded-xl px-2 py-1.5 hover:bg-[var(--app-bg)]"
              )}
            >
              <span className="text-2xl">{m.emoji}</span>
              <span className="text-[10px] text-muted-foreground">{m.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
