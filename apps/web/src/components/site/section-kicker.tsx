import type { ReactNode } from "react";

export function SectionKicker({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-[11px] font-semibold tracking-widest text-primary uppercase">
      <span className="size-1.5 rounded-full bg-primary" />
      {children}
    </span>
  );
}
