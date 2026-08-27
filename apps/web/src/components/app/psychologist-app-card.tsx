import Link from "next/link";
import { Video, Coffee, MapPin } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StarRating } from "@/components/app/app-ui";
import { cn } from "@/lib/utils";

type Psychologist = {
  id: number;
  slug: string;
  title: string;
  city: string | null;
  sessionPriceTl: number | null;
  photoUrl: string | null;
  onlineAvailable: boolean;
  introCallEnabled?: boolean;
  ratingAverage?: number;
  specialties: { specialty: { name: string } }[];
  user?: { fullName: string } | null;
};

export function PsychologistAppCard({
  psychologist,
  variant = "list",
}: {
  psychologist: Psychologist;
  variant?: "list" | "compact";
}) {
  const name = psychologist.user?.fullName ?? psychologist.title;
  const specialties = psychologist.specialties.map((s) => s.specialty.name);
  const price = psychologist.sessionPriceTl;
  const rating = psychologist.ratingAverage ?? 0;

  if (variant === "compact") {
    return (
      <Link
        href={`/uygulama/psikologlar/${psychologist.slug}`}
        className="app-card press flex w-[168px] flex-col gap-2 p-3"
      >
        <Avatar size="lg" className="size-14">
          <AvatarImage src={psychologist.photoUrl ?? undefined} alt={name} />
          <AvatarFallback>{name.slice(0, 1)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="truncate text-[13px] font-semibold text-foreground">{name}</p>
          <p className="truncate text-[11px] text-muted-foreground">
            {specialties[0] ?? psychologist.title}
          </p>
        </div>
        <div className="flex items-center justify-between">
          {rating > 0 ? (
            <StarRating value={rating} />
          ) : (
            <span className="text-[11px] text-muted-foreground">Yeni</span>
          )}
          {price != null && (
            <span className="text-[12px] font-semibold text-foreground">
              {price.toLocaleString("tr-TR")}₺
            </span>
          )}
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/uygulama/psikologlar/${psychologist.slug}`}
      className="app-card press flex gap-3 p-3.5"
    >
      <Avatar size="lg" className="size-16 shrink-0">
        <AvatarImage src={psychologist.photoUrl ?? undefined} alt={name} />
        <AvatarFallback className="text-base">{name.slice(0, 1)}</AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate font-semibold text-foreground">{name}</p>
            <p className="truncate text-[13px] text-muted-foreground">{psychologist.title}</p>
          </div>
          {rating > 0 && <StarRating value={rating} className="shrink-0" />}
        </div>

        {specialties.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1">
            {specialties.slice(0, 2).map((s) => (
              <span
                key={s}
                className="rounded-md bg-[var(--app-bg)] px-1.5 py-0.5 text-[11px] text-muted-foreground"
              >
                {s}
              </span>
            ))}
          </div>
        )}

        <div className="mt-2 flex items-center gap-3 text-[11px] text-muted-foreground">
          {psychologist.onlineAvailable && (
            <span className="inline-flex items-center gap-1">
              <Video className="size-3" /> Online
            </span>
          )}
          {psychologist.introCallEnabled && (
            <span className="inline-flex items-center gap-1">
              <Coffee className="size-3" /> Ön görüşme
            </span>
          )}
          {psychologist.city && (
            <span className="inline-flex items-center gap-1">
              <MapPin className="size-3" /> {psychologist.city}
            </span>
          )}
          {price != null && (
            <span className={cn("ml-auto font-semibold text-foreground")}>
              {price.toLocaleString("tr-TR")}₺
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
