"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

type Slot = { id: number; startTime: Date; status: string };

const STATUS_DOT: Record<string, string> = {
  musait: "bg-emerald-500",
  dolu: "bg-primary",
  pasif: "bg-muted-foreground/40",
};

export function WeekCalendarStrip({ slots }: { slots: Slot[] }) {
  const days = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Array.from({ length: 14 }, (_, i) => {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      const daySlots = slots
        .filter((slot) => new Date(slot.startTime).toDateString() === date.toDateString())
        .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
      return { date, slots: daySlots };
    });
  }, [slots]);

  return (
    <div>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {days.map((day) => {
          const isToday = day.date.toDateString() === new Date().toDateString();
          return (
            <Card
              key={day.date.toISOString()}
              size="sm"
              className={cn("w-32 shrink-0", isToday && "ring-2 ring-primary/40")}
            >
              <CardContent>
                <p className="text-xs font-medium text-muted-foreground capitalize">
                  {day.date.toLocaleDateString("tr-TR", { weekday: "short" })}
                </p>
                <p className="text-lg font-semibold text-foreground">{day.date.getDate()}</p>
                <div className="mt-2 flex flex-col gap-1">
                  {day.slots.length === 0 && <span className="text-xs text-muted-foreground">—</span>}
                  {day.slots.slice(0, 4).map((slot) => (
                    <span key={slot.id} className="flex items-center gap-1.5 text-xs text-foreground">
                      <span
                        className={cn(
                          "size-1.5 shrink-0 rounded-full",
                          STATUS_DOT[slot.status] ?? "bg-muted-foreground"
                        )}
                      />
                      {new Date(slot.startTime).toLocaleTimeString("tr-TR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  ))}
                  {day.slots.length > 4 && (
                    <span className="text-xs text-muted-foreground">+{day.slots.length - 4} daha</span>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="size-1.5 rounded-full bg-emerald-500" /> Müsait
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-1.5 rounded-full bg-primary" /> Dolu
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-1.5 rounded-full bg-muted-foreground/40" /> Pasif
        </span>
      </div>
    </div>
  );
}
