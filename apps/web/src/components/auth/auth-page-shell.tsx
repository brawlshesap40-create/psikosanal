import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function AuthPageShell({
  children,
  maxWidth = "max-w-md",
}: {
  children: ReactNode;
  maxWidth?: string;
}) {
  return (
    <div className="bg-grain relative flex min-h-[calc(100vh-4rem)] items-center overflow-hidden">
      <div className="mesh-gradient opacity-60" />
      <div className={cn("mx-auto w-full px-4 py-16 sm:px-6", maxWidth)}>{children}</div>
    </div>
  );
}
