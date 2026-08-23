import Link from "next/link";
import { Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { FavoriteButton } from "@/components/psychologists/favorite-button";

type PsychologistCardProps = {
  psychologist: {
    id: number;
    slug: string;
    title: string;
    city: string | null;
    sessionPriceTl: number | null;
    photoUrl: string | null;
    onlineAvailable: boolean;
    introCallEnabled?: boolean;
    ratingAverage?: number;
    specialties: { specialty: { id: number; name: string } }[];
    user?: { fullName: string };
  };
  isFavorite?: boolean;
  showFavorite?: boolean;
};

export function PsychologistCard({
  psychologist,
  isFavorite = false,
  showFavorite = false,
}: PsychologistCardProps) {
  const fullName = psychologist.user?.fullName ?? psychologist.title;

  return (
    <div className="relative">
      {showFavorite && (
        <FavoriteButton
          psychologistId={psychologist.id}
          initialFavorite={isFavorite}
          className="absolute right-3 top-3 z-10"
        />
      )}
      <Link href={`/psikologlar/${psychologist.slug}`}>
        <Card className="h-full transition-shadow hover:shadow-md">
          <CardContent className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <Avatar size="lg">
                <AvatarImage src={psychologist.photoUrl ?? undefined} alt={fullName} />
                <AvatarFallback>{fullName.slice(0, 1)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-foreground">{fullName}</p>
                <p className="text-sm text-muted-foreground">{psychologist.title}</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {Boolean(psychologist.ratingAverage) && (
                <span className="flex items-center gap-0.5 text-sm font-medium text-foreground">
                  <Star className="size-3.5 fill-amber-400 text-amber-400" />
                  {psychologist.ratingAverage!.toFixed(1)}
                </span>
              )}
              {psychologist.introCallEnabled && (
                <Badge variant="secondary">Ücretsiz Ön Görüşme</Badge>
              )}
              {psychologist.specialties.slice(0, 2).map((entry) => (
                <Badge key={entry.specialty.id} variant="secondary">
                  {entry.specialty.name}
                </Badge>
              ))}
            </div>

            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>{psychologist.city ?? "Online"}</span>
              {psychologist.sessionPriceTl && (
                <span className="font-medium text-foreground">
                  {psychologist.sessionPriceTl.toLocaleString("tr-TR")} ₺ / seans
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      </Link>
    </div>
  );
}
