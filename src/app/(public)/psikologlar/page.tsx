import Link from "next/link";
import { getApprovedPsychologists, type PsychologistSort } from "@/lib/psychologists/queries";
import { getAllSpecialties } from "@/lib/specialties/queries";
import { getOptionalSession } from "@/lib/auth/dal";
import { getFavoritePsychologistIds } from "@/lib/favorites/queries";
import { PsychologistCard } from "@/components/psychologists/psychologist-card";
import { PsychologistFilterForm } from "@/components/psychologists/psychologist-filter-form";
import { Button } from "@/components/ui/button";

type SearchParams = {
  uzmanlik?: string;
  sehir?: string;
  online?: string;
  minFiyat?: string;
  maxFiyat?: string;
  cinsiyet?: string;
  dil?: string;
  yaklasim?: string;
  sirala?: string;
  sayfa?: string;
};

export default async function PsikologlarPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const session = await getOptionalSession();
  const page = Math.max(1, Number(params.sayfa) || 1);

  const [{ items: psychologists, total, pageSize }, specialties, favoriteIds] = await Promise.all([
    getApprovedPsychologists({
      specialtySlug: params.uzmanlik || undefined,
      city: params.sehir || undefined,
      onlineOnly: params.online === "1",
      minPrice: params.minFiyat ? Number(params.minFiyat) : undefined,
      maxPrice: params.maxFiyat ? Number(params.maxFiyat) : undefined,
      gender: params.cinsiyet || undefined,
      language: params.dil || undefined,
      approach: params.yaklasim || undefined,
      sort: (params.sirala as PsychologistSort) || undefined,
      page,
    }),
    getAllSpecialties(),
    session?.role === "danisan" ? getFavoritePsychologistIds(session.userId) : Promise.resolve(new Set<number>()),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  function pageHref(target: number) {
    const search = new URLSearchParams(
      Object.entries(params).filter(([, v]) => Boolean(v)) as [string, string][]
    );
    search.set("sayfa", String(target));
    return `/psikologlar?${search.toString()}`;
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-semibold text-foreground">Psikolog Bul</h1>
      <p className="mt-1 text-sm text-muted-foreground">{total} psikolog listeleniyor</p>

      <div className="mt-6 grid gap-8 lg:grid-cols-[260px_1fr]">
        <PsychologistFilterForm specialties={specialties} />

        <div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {psychologists.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Bu kriterlere uygun psikolog bulunamadı.
              </p>
            )}
            {psychologists.map((psychologist) => (
              <PsychologistCard
                key={psychologist.id}
                psychologist={psychologist}
                showFavorite={session?.role === "danisan"}
                isFavorite={favoriteIds.has(psychologist.id)}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              {page > 1 ? (
                <Button size="sm" variant="outline" nativeButton={false} render={<Link href={pageHref(page - 1)} />}>
                  Önceki
                </Button>
              ) : (
                <Button size="sm" variant="outline" disabled>
                  Önceki
                </Button>
              )}
              <span className="text-sm text-muted-foreground">
                Sayfa {page} / {totalPages}
              </span>
              {page < totalPages ? (
                <Button size="sm" variant="outline" nativeButton={false} render={<Link href={pageHref(page + 1)} />}>
                  Sonraki
                </Button>
              ) : (
                <Button size="sm" variant="outline" disabled>
                  Sonraki
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
