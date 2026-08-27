"use client";

import { type ReactNode, type MouseEvent } from "react";
import { cn } from "@/lib/utils";

export function SpotlightCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  function handleMove(event: MouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty("--mx", `${event.clientX - rect.left}px`);
    event.currentTarget.style.setProperty("--my", `${event.clientY - rect.top}px`);
  }

  return (
    <div
      onMouseMove={handleMove}
      className={cn(
        "spotlight-card h-full overflow-hidden rounded-2xl [&>:first-child]:h-full",
        className
      )}
    >
      {children}
      <div className="spotlight-layer" />
    </div>
  );
}
