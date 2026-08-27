import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function SectionHeader({
  title,
  href,
  hrefLabel = "Tümü",
  className,
}: {
  title: string;
  href?: string;
  hrefLabel?: string;
  className?: string;
}) {
  return (
    <div className={cn("mb-3 flex items-center justify-between", className)}>
      <h2 className="text-[15px] font-semibold tracking-tight text-foreground">{title}</h2>
      {href && (
        <Link
          href={href}
          className="press flex items-center gap-0.5 text-[13px] font-medium text-brand"
        >
          {hrefLabel}
          <ChevronRight className="size-4" />
        </Link>
      )}
    </div>
  );
}

export function Chip({
  children,
  active = false,
  className,
}: {
  children: React.ReactNode;
  active?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[12px] font-medium whitespace-nowrap",
        active
          ? "bg-brand text-brand-foreground"
          : "app-hairline border bg-[var(--app-surface)] text-muted-foreground",
        className
      )}
    >
      {children}
    </span>
  );
}

export function StarRating({ value, className }: { value: number; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-amber-400/15 px-2 py-0.5 text-[12px] font-semibold text-amber-600 dark:text-amber-400",
        className
      )}
    >
      <svg viewBox="0 0 24 24" className="size-3 fill-current">
        <path d="M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.9 5.9 21.4l1.4-6.8L2.2 9.9l6.9-.8z" />
      </svg>
      {value.toFixed(1)}
    </span>
  );
}
