import { cn } from "@/lib/utils";

/**
 * Psikosanal brand mark: a speech bubble with a calm smiling face — "talk
 * therapy, online". Colours are driven by the `--brand` / `--brand-foreground`
 * tokens so the mark tracks light/dark automatically.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      role="img"
      aria-hidden="true"
      className={cn("size-7", className)}
    >
      <rect x="2" y="2" width="28" height="28" rx="8.5" className="fill-brand" />
      <g className="fill-brand-foreground">
        <rect x="7.5" y="8" width="17" height="12.5" rx="5" />
        <path d="M11 19 L10 24.6 L16 19.5 Z" />
      </g>
      <g className="fill-brand">
        <circle cx="13" cy="13" r="1.15" />
        <circle cx="19" cy="13" r="1.15" />
      </g>
      <path
        d="M12.8 15.4 Q16 18.4 19.2 15.4"
        fill="none"
        strokeWidth="2.2"
        strokeLinecap="round"
        className="stroke-brand"
      />
    </svg>
  );
}

/**
 * Full lock-up: mark + "Psikosanal" wordmark, echoing the site's habit of
 * colouring the second half of a heading in the brand tone.
 */
export function Logo({
  className,
  markClassName,
  showWordmark = true,
}: {
  className?: string;
  markClassName?: string;
  showWordmark?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <LogoMark className={markClassName} />
      {showWordmark && (
        <span className="text-lg font-semibold tracking-tight text-foreground">
          Psiko<span className="text-brand">sanal</span>
        </span>
      )}
    </span>
  );
}
