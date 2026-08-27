import Link from "next/link";
import { SlidersHorizontal } from "lucide-react";
import { getApprovedPsychologists } from "@/lib/psychologists/queries";
import { getAllSpecialties } from "@/lib/specialties/queries";
import { AppScreen } from "@/components/app/app-screen";
import { PsychologistAppCard } from "@/components/app/psychologist-app-card";
import { cn } from "@/lib/utils";

type SearchParams = {
  uzmanlik?: string;
  online?: string;
  ontanisma?: string;
  sirala?: string;
};

export default async function AppPsychologistsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const sort = sp.sirala === "fiyat" ? "fiyat_artan" : "puan";

  const [{ items }, specialties] = await Promise.all([
    getApprovedPsychologists({
      specialtySlug: sp.uzmanlik,
      onlineOnly: sp.online === "1",
      introOnly: sp.ontanisma === "1",
      sort,
      pageSize: 50,
    }),
    getAllSpecialties(),
  ]);

  const build = (patch: Partial<SearchParams>) => {
    const next = { ...sp, ...patch };
    const qs = Object.entries(next)
      .filter(([, v]) => v)
      .map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`)
      .join("&");
    return qs ? `/uygulama/psikologlar?${qs}` : "/uygulama/psikologlar";
  };

  return (
    <AppScreen
      title="Psikologlar"
      subtitle={`${items.length} uzman`}
      action={
        <Link
          href="/psikologlar"
          className="press grid size-9 place-items-center rounded-full text-muted-foreground hover:text-foreground"
          aria-label="Gelişmiş filtre"
        >
          <SlidersHorizontal className="size-5" />
        </Link>
      }
      contentClassName="px-0"
    >
      {/* filtre çubuğu */}
      <div className="app-hscroll px-5">
        <FilterChip href={build({ online: sp.online === "1" ? undefined : "1" })} active={sp.online === "1"}>
          Online
        </FilterChip>
        <FilterChip
          href={build({ ontanisma: sp.ontanisma === "1" ? undefined : "1" })}
          active={sp.ontanisma === "1"}
        >
          Ön görüşme
        </FilterChip>
        <span className="mx-1 w-px self-stretch bg-[var(--app-hairline)]" />
        <FilterChip href={build({ sirala: undefined })} active={sort === "puan"}>
          En yüksek puan
        </FilterChip>
        <FilterChip href={build({ sirala: "fiyat" })} active={sort === "fiyat_artan"}>
          En uygun fiyat
        </FilterChip>
      </div>

      {/* uzmanlık alanları */}
      {specialties.length > 0 && (
        <div className="app-hscroll mt-2 px-5">
          <FilterChip href={build({ uzmanlik: undefined })} active={!sp.uzmanlik}>
            Tümü
          </FilterChip>
          {specialties.map((s) => (
            <FilterChip
              key={s.slug}
              href={build({ uzmanlik: sp.uzmanlik === s.slug ? undefined : s.slug })}
              active={sp.uzmanlik === s.slug}
            >
              {s.name}
            </FilterChip>
          ))}
        </div>
      )}

      <div className="mt-4 flex flex-col gap-3 px-5">
        {items.length === 0 ? (
          <p className="py-16 text-center text-sm text-muted-foreground">
            Bu filtrelere uygun psikolog bulunamadı.
          </p>
        ) : (
          items.map((p) => <PsychologistAppCard key={p.id} psychologist={p} />)
        )}
      </div>
    </AppScreen>
  );
}

function FilterChip({
  href,
  active,
  children,
}: {
  href: string;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "press rounded-full px-3.5 py-2 text-[12px] font-semibold whitespace-nowrap",
        active
          ? "bg-brand text-brand-foreground"
          : "app-hairline border bg-[var(--app-surface)] text-muted-foreground"
      )}
    >
      {children}
    </Link>
  );
}
