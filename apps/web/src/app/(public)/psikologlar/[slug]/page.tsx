import { notFound } from "next/navigation";
import { Star, Briefcase, MessageSquareText, ShieldCheck } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getOptionalSession } from "@/lib/auth/dal";
import { getBookableSlots } from "@/lib/availability/queries";
import { getPsychologistBySlug } from "@/lib/psychologists/queries";
import { getActivePackagesForPsychologist } from "@/lib/packages/queries";
import { getReviewStats, getReviewsForPsychologist } from "@/lib/reviews/queries";
import { getFavoritePsychologistIds } from "@/lib/favorites/queries";
import { isOnWaitlist } from "@/lib/waitlist/queries";
import { GENDER_OPTIONS } from "@/lib/psychologists/options";
import { BookingPanel } from "@/components/psychologists/booking-panel";
import { PackagePurchaseCard } from "@/components/packages/package-purchase-card";
import { ReviewList } from "@/components/reviews/review-list";
import { FavoriteButton } from "@/components/psychologists/favorite-button";
import { WaitlistButton } from "@/components/psychologists/waitlist-button";
import { ScrollReveal } from "@/components/site/scroll-reveal";
import { SpotlightCard } from "@/components/site/spotlight-card";

export default async function PsikologProfilPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const psychologist = await getPsychologistBySlug(slug);
  if (!psychologist) notFound();

  const [slots, session, packages, reviews, reviewStats] = await Promise.all([
    getBookableSlots(psychologist.id),
    getOptionalSession(),
    getActivePackagesForPsychologist(psychologist.id),
    getReviewsForPsychologist(psychologist.id),
    getReviewStats(psychologist.id),
  ]);

  const fullName = psychologist.user.fullName;
  const isAuthenticated = Boolean(session);
  const isDanisan = session?.role === "danisan";
  const nextPath = `/psikologlar/${slug}`;

  const [isFavorite, waitlisted] =
    session?.role === "danisan"
      ? await Promise.all([
          getFavoritePsychologistIds(session.userId).then((ids) => ids.has(psychologist.id)),
          isOnWaitlist(session.userId, psychologist.id),
        ])
      : [false, false];

  return (
    <div>
      <div className="panel-glow border-b border-border bg-muted/30">
        <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <Avatar className="size-20 shadow-lg ring-4 ring-background">
                <AvatarImage src={psychologist.photoUrl ?? undefined} alt={fullName} />
                <AvatarFallback className="text-2xl">{fullName.slice(0, 1)}</AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-semibold text-foreground">{fullName}</h1>
                <p className="text-sm text-muted-foreground">{psychologist.title}</p>
                <p className="text-sm text-muted-foreground">
                  {psychologist.city} · {psychologist.experienceYears ?? 0} yıl deneyim
                </p>
              </div>
            </div>
            {isDanisan && (
              <FavoriteButton psychologistId={psychologist.id} initialFavorite={isFavorite} />
            )}
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3 sm:max-w-sm">
            <div className="flex items-center gap-2">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Briefcase className="size-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {psychologist.experienceYears ?? 0}
                </p>
                <p className="text-xs text-muted-foreground">Yıl Deneyim</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Star className="size-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {reviewStats.count > 0 ? reviewStats.average.toFixed(1) : "—"}
                </p>
                <p className="text-xs text-muted-foreground">Ortalama Puan</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <MessageSquareText className="size-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{reviewStats.count}</p>
                <p className="text-xs text-muted-foreground">Değerlendirme</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <div className="grid gap-8 md:grid-cols-[1fr_320px]">
          <div>
            <div className="flex flex-wrap gap-1.5">
              {psychologist.introCallEnabled && (
                <Badge variant="secondary">Ücretsiz Ön Görüşme</Badge>
              )}
              {psychologist.gender !== "belirtilmemis" && (
                <Badge variant="secondary">
                  {GENDER_OPTIONS.find((o) => o.value === psychologist.gender)?.label}
                </Badge>
              )}
              {psychologist.languages.map((language) => (
                <Badge key={language} variant="outline">
                  {language}
                </Badge>
              ))}
              {psychologist.specialties.map((entry) => (
                <Badge key={entry.specialty.id} variant="secondary">
                  {entry.specialty.name}
                </Badge>
              ))}
              {psychologist.approaches.map((approach) => (
                <Badge key={approach} variant="outline">
                  {approach}
                </Badge>
              ))}
            </div>

            <Separator className="my-6" />

            <h2 className="text-base font-medium text-foreground">Hakkında</h2>
            <p className="mt-2 whitespace-pre-line text-sm text-muted-foreground">
              {psychologist.bio}
            </p>

            {packages.length > 0 && (
              <>
                <Separator className="my-6" />
                <h2 className="text-base font-medium text-foreground">Paketler</h2>
                <div className="mt-3 flex flex-col gap-3">
                  {packages.map((pkg) => (
                    <PackagePurchaseCard
                      key={pkg.id}
                      pkg={pkg}
                      isAuthenticated={isAuthenticated}
                      isDanisan={isDanisan}
                      nextPath={nextPath}
                    />
                  ))}
                </div>
              </>
            )}

            <Separator className="my-6" />
            <h2 className="text-base font-medium text-foreground">Değerlendirmeler</h2>
            <div className="mt-3">
              <ReviewList reviews={reviews} />
            </div>
          </div>

          <ScrollReveal>
            <SpotlightCard>
              <Card className="h-fit">
                <CardContent className="flex flex-col gap-4">
                  {psychologist.sessionPriceTl && (
                    <div>
                      <p className="text-xs text-muted-foreground">Seans Ücreti</p>
                      <p className="text-lg font-semibold text-foreground">
                        {psychologist.sessionPriceTl.toLocaleString("tr-TR")} ₺
                      </p>
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
                      isAuthenticated={isAuthenticated}
                      isDanisan={isDanisan}
                      nextPath={nextPath}
                    />
                  )}
                  <div className="flex items-center gap-1.5 border-t border-border pt-3 text-xs text-muted-foreground">
                    <ShieldCheck className="size-3.5 shrink-0" />
                    Randevuya özel, güvenli görüşme odası
                  </div>
                </CardContent>
              </Card>
            </SpotlightCard>
          </ScrollReveal>
        </div>
      </div>
    </div>
  );
}
