import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Briefcase, Star, MessageSquareText, ShieldCheck, MessageCircle } from "lucide-react";
import { getOptionalSession } from "@/lib/auth/dal";
import { getPsychologistBySlug } from "@/lib/psychologists/queries";
import { getBookableSlots } from "@/lib/availability/queries";
import { getReviewsForPsychologist, getReviewStats } from "@/lib/reviews/queries";
import { getFavoritePsychologistIds } from "@/lib/favorites/queries";
import { isOnWaitlist } from "@/lib/waitlist/queries";
import { GENDER_OPTIONS } from "@/lib/psychologists/options";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BookingPanel } from "@/components/psychologists/booking-panel";
import { WaitlistButton } from "@/components/psychologists/waitlist-button";
import { FavoriteButton } from "@/components/psychologists/favorite-button";
import { ReviewList } from "@/components/reviews/review-list";

export default async function AppPsychologistDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const psychologist = await getPsychologistBySlug(slug);
  if (!psychologist) notFound();

  const [slots, session, reviews, reviewStats] = await Promise.all([
    getBookableSlots(psychologist.id),
    getOptionalSession(),
    getReviewsForPsychologist(psychologist.id),
    getReviewStats(psychologist.id),
  ]);

  const isDanisan = session?.role === "danisan";
  const nextPath = `/uygulama/psikologlar/${slug}`;
  const [isFavorite, waitlisted] = isDanisan
    ? await Promise.all([
        getFavoritePsychologistIds(session.userId).then((ids) => ids.has(psychologist.id)),
        isOnWaitlist(session.userId, psychologist.id),
      ])
    : [false, false];

  const name = psychologist.user.fullName;
  const chips = [
    ...(psychologist.introCallEnabled ? ["Ücretsiz ön görüşme"] : []),
    ...(psychologist.gender !== "belirtilmemis"
      ? [GENDER_OPTIONS.find((o) => o.value === psychologist.gender)?.label ?? ""]
      : []),
    ...psychologist.languages,
    ...psychologist.specialties.map((e) => e.specialty.name),
    ...psychologist.approaches,
  ].filter(Boolean);

  return (
    <div className="mx-auto min-h-dvh max-w-md">
      {/* hero */}
      <div
        className="app-hero-bg px-5 pb-8 text-white"
        style={{ paddingTop: "max(env(safe-area-inset-top), 16px)" }}
      >
        <div className="flex items-center justify-between pt-1">
          <Link
            href="/uygulama/psikologlar"
            aria-label="Geri"
            className="press -ml-1 grid size-9 place-items-center rounded-full bg-white/15"
          >
            <ChevronLeft className="size-5" />
          </Link>
          {isDanisan && (
            <div className="rounded-full bg-white/15 p-0.5">
              <FavoriteButton psychologistId={psychologist.id} initialFavorite={isFavorite} />
            </div>
          )}
        </div>

        <div className="mt-3 flex items-center gap-4">
          <Avatar className="size-20 ring-4 ring-white/25">
            <AvatarImage src={psychologist.photoUrl ?? undefined} alt={name} />
            <AvatarFallback className="text-2xl text-brand">{name.slice(0, 1)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <h1 className="text-xl font-semibold tracking-tight">{name}</h1>
            <p className="text-sm text-white/85">{psychologist.title}</p>
            {psychologist.city && (
              <p className="text-[13px] text-white/70">
                {psychologist.city}
                {psychologist.experienceYears
                  ? ` · ${psychologist.experienceYears} yıl deneyim`
                  : ""}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="app-rise -mt-6 rounded-t-[28px] bg-[var(--app-bg)] px-5 pt-6 pb-36">
        <div className="flex flex-col gap-6">
          {/* istatistik */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { icon: Briefcase, value: psychologist.experienceYears ?? 0, label: "Yıl" },
              {
                icon: Star,
                value: reviewStats.count > 0 ? reviewStats.average.toFixed(1) : "—",
                label: "Puan",
              },
              { icon: MessageSquareText, value: reviewStats.count, label: "Yorum" },
            ].map((s, i) => (
              <div key={i} className="app-card flex flex-col items-center gap-1 py-3">
                <s.icon className="size-4 text-brand" />
                <span className="text-[15px] font-semibold text-foreground">{s.value}</span>
                <span className="text-[11px] text-muted-foreground">{s.label}</span>
              </div>
            ))}
          </div>

          {/* randevu */}
          <section className="app-card-lg p-4">
            {psychologist.sessionPriceTl != null && (
              <div className="mb-3 flex items-baseline justify-between">
                <span className="text-[13px] text-muted-foreground">Seans ücreti</span>
                <span className="text-lg font-semibold text-foreground">
                  {psychologist.sessionPriceTl.toLocaleString("tr-TR")} ₺
                </span>
              </div>
            )}
            {slots.length === 0 && isDanisan ? (
              <WaitlistButton
                psychologistId={psychologist.id}
                slug={slug}
                initialJoined={waitlisted}
              />
            ) : (
              <BookingPanel
                slots={slots.map((slot) => ({
                  id: slot.id,
                  startTime: slot.startTime.toISOString(),
                  durationMinutes: slot.durationMinutes,
                  sessionType: slot.sessionType,
                  isIntro: slot.isIntro,
                }))}
                isAuthenticated={Boolean(session)}
                isDanisan={Boolean(isDanisan)}
                nextPath={nextPath}
              />
            )}
            <div className="mt-3 flex items-center gap-1.5 border-t border-[var(--app-hairline)] pt-3 text-[11px] text-muted-foreground">
              <ShieldCheck className="size-3.5 shrink-0" />
              Randevuya özel, güvenli görüşme odası
            </div>
          </section>

          {isDanisan && (
            <Link
              href={`/uygulama/mesajlar/${psychologist.id}`}
              className="press flex items-center justify-center gap-1.5 rounded-full border border-[var(--app-hairline)] bg-[var(--app-surface)] py-3 text-[13px] font-semibold text-foreground"
            >
              <MessageCircle className="size-4" /> Mesaj gönder
            </Link>
          )}

          {chips.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {chips.map((c) => (
                <span
                  key={c}
                  className="app-hairline rounded-full border bg-[var(--app-surface)] px-2.5 py-1 text-[12px] text-muted-foreground"
                >
                  {c}
                </span>
              ))}
            </div>
          )}

          {psychologist.bio && (
            <section>
              <h2 className="mb-2 text-[15px] font-semibold text-foreground">Hakkında</h2>
              <p className="text-[13px] leading-relaxed whitespace-pre-line text-muted-foreground">
                {psychologist.bio}
              </p>
            </section>
          )}

          <section>
            <h2 className="mb-2 text-[15px] font-semibold text-foreground">
              Değerlendirmeler
            </h2>
            <div className="app-card p-4">
              <ReviewList reviews={reviews} />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
