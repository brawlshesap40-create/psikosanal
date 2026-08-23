import { verifyDanisanSession } from "@/lib/auth/dal";
import { getFavoritesForClient } from "@/lib/favorites/queries";
import { PsychologistCard } from "@/components/psychologists/psychologist-card";

export default async function FavorilerimPage() {
  const session = await verifyDanisanSession();
  const favorites = await getFavoritesForClient(session.userId);

  return (
    <div>
      <h1 className="text-xl font-semibold text-foreground">Favorilerim</h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {favorites.length === 0 && (
          <p className="text-sm text-muted-foreground">Henüz favori psikoloğunuz yok.</p>
        )}
        {favorites.map((favorite) => (
          <PsychologistCard
            key={favorite.id}
            psychologist={favorite.psychologist}
            showFavorite
            isFavorite
          />
        ))}
      </div>
    </div>
  );
}
