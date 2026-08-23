"use client";

import { useState, useTransition } from "react";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { toggleFavoriteAction } from "@/lib/favorites/actions";

export function FavoriteButton({
  psychologistId,
  initialFavorite,
  className,
}: {
  psychologistId: number;
  initialFavorite: boolean;
  className?: string;
}) {
  const [isFavorite, setIsFavorite] = useState(initialFavorite);
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      aria-label={isFavorite ? "Favorilerden çıkar" : "Favorilere ekle"}
      disabled={pending}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        setIsFavorite((prev) => !prev);
        startTransition(async () => {
          try {
            const result = await toggleFavoriteAction(psychologistId);
            setIsFavorite(result.isFavorite);
          } catch {
            setIsFavorite((prev) => !prev);
            toast.error("İşlem gerçekleştirilemedi.");
          }
        });
      }}
      className={cn(
        "flex size-8 items-center justify-center rounded-full bg-background/80 backdrop-blur hover:bg-background",
        className
      )}
    >
      <Heart
        className={cn("size-4", isFavorite ? "fill-destructive text-destructive" : "text-muted-foreground")}
      />
    </button>
  );
}
