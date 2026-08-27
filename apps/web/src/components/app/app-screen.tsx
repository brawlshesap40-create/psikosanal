import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

type AppScreenProps = {
  title: string;
  subtitle?: string;
  /** "hero" = degrade başlık + yukarı çekilmiş içerik yaprağı; "plain" = sade sticky bar */
  variant?: "hero" | "plain";
  back?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  contentClassName?: string;
};

export function AppScreen({
  title,
  subtitle,
  variant = "plain",
  back,
  action,
  children,
  contentClassName,
}: AppScreenProps) {
  if (variant === "hero") {
    return (
      <div className="mx-auto min-h-dvh max-w-md">
        <div
          className="app-hero-bg px-5 pb-16 text-white"
          style={{ paddingTop: "max(env(safe-area-inset-top), 20px)" }}
        >
          <div className="flex items-start justify-between gap-3 pt-3">
            <div className="min-w-0">
              <h1 className="text-[26px] leading-tight font-semibold tracking-tight text-balance">
                {title}
              </h1>
              {subtitle && (
                <p className="mt-1 text-sm text-white/80">{subtitle}</p>
              )}
            </div>
            {action}
          </div>
        </div>

        <div
          className={cn(
            "app-rise -mt-10 min-h-[60dvh] rounded-t-[28px] bg-[var(--app-bg)] px-5 pt-6 pb-36",
            contentClassName
          )}
        >
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-dvh max-w-md">
      <header
        className="app-hairline app-blur-bg sticky top-0 z-30 flex h-14 items-center gap-1.5 border-b px-3"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        {back && (
          <Link
            href={back}
            aria-label="Geri"
            className="press -ml-1 flex size-9 items-center justify-center rounded-full text-muted-foreground hover:bg-black/5 hover:text-foreground dark:hover:bg-white/10"
          >
            <ChevronLeft className="size-5" />
          </Link>
        )}
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-[17px] font-semibold tracking-tight text-foreground">
            {title}
          </h1>
          {subtitle && (
            <p className="truncate text-[11px] text-muted-foreground">{subtitle}</p>
          )}
        </div>
        {action}
      </header>

      <div className={cn("app-rise px-5 pt-5 pb-36", contentClassName)}>{children}</div>
    </div>
  );
}
