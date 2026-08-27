import Link from "next/link";
import {
  Star,
  ShieldCheck,
  Lock,
  Video,
  Sparkles,
  Users2,
  MessagesSquare,
  CheckCircle2,
  MessageCircle,
  ArrowUpRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getApprovedPsychologists, countApprovedPsychologists } from "@/lib/psychologists/queries";
import { getAllSpecialties } from "@/lib/specialties/queries";
import { getFeaturedReviews, getOverallReviewStats } from "@/lib/reviews/queries";
import { listPublishedPosts } from "@/lib/blog/queries";
import { listTests } from "@/lib/psych-tests/queries";
import { PsychologistCard } from "@/components/psychologists/psychologist-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollReveal } from "@/components/site/scroll-reveal";
import { SpotlightCard } from "@/components/site/spotlight-card";
import { AnimatedCounter } from "@/components/site/animated-counter";
import { RotatingWord } from "@/components/site/rotating-word";
import { SectionKicker } from "@/components/site/section-kicker";

const CONCERNS = ["Kaygı", "Depresyon", "İlişkiler", "Stres", "Travma"];

export default async function HomePage() {
  const [
    { items: featured },
    psychologistCount,
    specialties,
    reviewStats,
    testimonials,
    posts,
    tests,
  ] = await Promise.all([
    getApprovedPsychologists({ sort: "puan", pageSize: 3 }),
    countApprovedPsychologists(),
    getAllSpecialties(),
    getOverallReviewStats(),
    getFeaturedReviews(3),
    listPublishedPosts(),
    listTests(),
  ]);

  const stats = [
    { label: "Onaylı Psikolog", value: psychologistCount, suffix: "+", decimals: 0 },
    { label: "Uzmanlık Alanı", value: specialties.length, suffix: "", decimals: 0 },
    ...(reviewStats.count > 0
      ? [{ label: "Danışan Puanı", value: reviewStats.average, suffix: " / 5", decimals: 1 }]
      : []),
  ];

  return (
    <div>
      <section className="bg-grain relative overflow-hidden">
        <div className="mesh-gradient" />
        <div className="mx-auto grid max-w-6xl gap-12 px-4 py-20 sm:px-6 sm:py-28 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-32">
          <div className="text-center lg:text-left">
            {featured.length > 0 && (
              <div className="mx-auto mb-6 flex w-fit items-center gap-2 rounded-full border border-border bg-card/80 py-1 pr-4 pl-1.5 text-xs text-muted-foreground shadow-sm backdrop-blur lg:mx-0">
                <span className="flex -space-x-2">
                  {featured.map((psychologist) => (
                    <Avatar key={psychologist.id} size="sm" className="ring-2 ring-background">
                      <AvatarImage
                        src={psychologist.photoUrl ?? undefined}
                        alt={psychologist.user?.fullName ?? psychologist.title}
                      />
                      <AvatarFallback>
                        {(psychologist.user?.fullName ?? psychologist.title).slice(0, 1)}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                </span>
                {psychologistCount}+ uzman psikolog yardımcı olmaya hazır
              </div>
            )}
            <h1 className="text-4xl leading-[1.05] font-semibold tracking-tighter text-balance sm:text-6xl lg:text-6xl">
              <span className="text-foreground">
                <RotatingWord words={CONCERNS} /> konusunda
              </span>{" "}
              <span className="text-foreground">uzman desteği bulun.</span>
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-base text-muted-foreground sm:text-lg lg:mx-0">
              Alanında uzman psikologları keşfedin, profillerini inceleyin ve online
              randevunuzu birkaç dakikada oluşturun. İster kendiniz arayın, ister birkaç
              soruyla size en uygun psikoloğu bulalım.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
              <Button size="lg" className="btn-shine" nativeButton={false} render={<Link href="/psikologlar" />}>
                Psikolog Bul
              </Button>
              <Button
                size="lg"
                variant="outline"
                nativeButton={false}
                render={<Link href="/eslesme" />}
              >
                <Sparkles /> Akıllı Eşleştirme
              </Button>
            </div>

            {stats.length > 0 && (
              <div className="mx-auto mt-12 flex max-w-lg flex-wrap items-center justify-center gap-x-10 gap-y-4 lg:mx-0 lg:justify-start">
                {stats.map((stat) => (
                  <div key={stat.label}>
                    <p className="text-2xl font-semibold text-foreground">
                      <AnimatedCounter value={stat.value} decimals={stat.decimals} suffix={stat.suffix} />
                    </p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="relative mx-auto hidden w-full max-w-sm lg:block">
            <Card className="rotate-2 shadow-xl shadow-black/[0.06]">
              <CardContent className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-foreground">Sıradaki Randevu</p>
                  <Badge variant="secondary">Bugün 14:00</Badge>
                </div>
                <div className="flex items-center gap-3">
                  <Avatar size="lg">
                    <AvatarFallback>A</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium text-foreground">Dr. Ayşe Yılmaz</p>
                    <p className="text-xs text-muted-foreground">Klinik Psikolog</p>
                  </div>
                </div>
                <Button size="sm" className="w-full">
                  <Video /> Görüşmeye Katıl
                </Button>
              </CardContent>
            </Card>

            <Card className="absolute -right-6 -bottom-8 w-56 -rotate-3 shadow-xl shadow-black/[0.06]">
              <CardContent className="flex items-center gap-2.5">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <CheckCircle2 className="size-4" />
                </div>
                <p className="text-xs text-foreground">Ücretsiz ön görüşme planlandı</p>
              </CardContent>
            </Card>

            <Card className="absolute top-6 -left-10 w-44 rotate-3 shadow-xl shadow-black/[0.06]">
              <CardContent className="flex items-center gap-2.5">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-amber-400/15 text-amber-500">
                  <MessageCircle className="size-4" />
                </div>
                <p className="text-xs text-foreground">Yeni mesajınız var</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <ScrollReveal>
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="flex flex-col items-center gap-3 text-center">
            <SectionKicker>Süreç</SectionKicker>
            <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Nasıl <span className="text-gradient-brand">Çalışır</span>
            </h2>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              { title: "1. Ara ya da Eşleşin", desc: "Filtrelerle kendiniz arayın veya Akıllı Eşleştirme ile size uygun psikologları görün." },
              { title: "2. İnceleyin", desc: "Psikologların profilini, deneyimini ve danışan yorumlarını okuyun." },
              { title: "3. Randevu Alın", desc: "Müsait saatlerden birini seçin; isterseniz önce ücretsiz bir ön görüşme yapın." },
            ].map((step) => (
              <SpotlightCard key={step.title}>
                <Card>
                  <CardContent className="py-2">
                    <h3 className="font-medium text-foreground">{step.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{step.desc}</p>
                  </CardContent>
                </Card>
              </SpotlightCard>
            ))}
          </div>
        </section>
      </ScrollReveal>

      {featured.length > 0 && (
        <ScrollReveal>
          <section className="mx-auto max-w-6xl border-t border-border px-4 py-16 sm:px-6 sm:py-24">
            <div className="flex flex-col items-center gap-3 text-center">
              <SectionKicker>Uzmanlar</SectionKicker>
              <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                Öne Çıkan <span className="text-gradient-brand">Psikologlar</span>
              </h2>
              <Link href="/psikologlar" className="text-sm text-primary hover:underline">
                Tümünü Gör
              </Link>
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((psychologist) => (
                <PsychologistCard key={psychologist.id} psychologist={psychologist} />
              ))}
            </div>
          </section>
        </ScrollReveal>
      )}

      <ScrollReveal>
        <section className="border-y border-border bg-muted/40">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
            <div className="flex flex-col items-center gap-3 text-center">
              <SectionKicker>Güvenlik</SectionKicker>
              <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                Güvenli ve <span className="text-gradient-brand">Gizli</span> Bir Deneyim
              </h2>
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <SpotlightCard>
                <Card>
                  <CardContent className="flex gap-3">
                    <Video className="mt-0.5 size-5 shrink-0 text-primary" />
                    <div>
                      <h3 className="font-medium text-foreground">Randevuya Özel Görüşme Odası</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Her görüşme, yalnızca sizin randevunuza ait, tek kullanımlık bir odada
                        gerçekleşir; kayıt tutulmaz.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </SpotlightCard>
              <SpotlightCard>
                <Card>
                  <CardContent className="flex gap-3">
                    <Lock className="mt-0.5 size-5 shrink-0 text-primary" />
                    <div>
                      <h3 className="font-medium text-foreground">Güvenli Ödeme</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Ödemeleriniz iyzico altyapısı üzerinden işlenir; kart bilgileriniz
                        platformumuzda saklanmaz.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </SpotlightCard>
              <SpotlightCard>
                <Card>
                  <CardContent className="flex gap-3">
                    <ShieldCheck className="mt-0.5 size-5 shrink-0 text-primary" />
                    <div>
                      <h3 className="font-medium text-foreground">KVKK Uyumlu Süreç</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Bilgileriniz yalnızca hizmetin yürütülmesi için kullanılır; detaylar{" "}
                        <Link href="/kvkk" className="underline hover:text-foreground">
                          KVKK metninde
                        </Link>
                        .
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </SpotlightCard>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {testimonials.length > 0 && (
        <ScrollReveal>
          <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
            <div className="flex flex-col items-center gap-3 text-center">
              <SectionKicker>Yorumlar</SectionKicker>
              <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                Danışanlarımız Ne <span className="text-gradient-brand">Diyor?</span>
              </h2>
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {testimonials.map((review) => (
                <Card key={review.id} className="h-full">
                  <CardContent className="flex h-full flex-col gap-2">
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((value) => (
                        <Star
                          key={value}
                          className={
                            value <= review.rating
                              ? "size-3.5 fill-amber-400 text-amber-400"
                              : "size-3.5 text-muted-foreground"
                          }
                        />
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground">&ldquo;{review.comment}&rdquo;</p>
                    <p className="text-xs text-foreground">
                      {review.client.fullName} · {review.psychologist.user.fullName}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        </ScrollReveal>
      )}

      <ScrollReveal>
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="flex flex-col items-center gap-3 text-center">
            <SectionKicker>Kaynaklar</SectionKicker>
            <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Kendinizi <span className="text-gradient-brand">Tanıyın</span>, Bilgi Edinin
            </h2>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:grid-rows-2">
            <Link href="/testler" className="lg:col-span-2 lg:row-span-2">
              <SpotlightCard className="h-full">
                <Card className="h-full card-interactive">
                  <CardContent className="flex h-full flex-col justify-between gap-6">
                    <div className="flex items-center justify-between">
                      <Sparkles className="size-6 text-primary" />
                      <ArrowUpRight className="size-4 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-foreground">
                        Öz-Değerlendirme Testleri
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {tests.length > 0
                          ? `${tests.length} kısa testle stres, kaygı, ruh hali ve ilişki doyumunuz hakkında anında geri bildirim alın.`
                          : "Kısa testlerle kendinizi tanıyın."}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </SpotlightCard>
            </Link>
            <Link href="/blog">
              <SpotlightCard className="h-full">
                <Card className="h-full card-interactive">
                  <CardContent>
                    <MessagesSquare className="size-5 text-primary" />
                    <h3 className="mt-3 font-medium text-foreground">Blog</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {posts.length > 0
                        ? `En son: "${posts[0].title}"`
                        : "Ruh sağlığı üzerine yazılar."}
                    </p>
                  </CardContent>
                </Card>
              </SpotlightCard>
            </Link>
            <Link href="/kurumsal">
              <SpotlightCard className="h-full">
                <Card className="h-full card-interactive">
                  <CardContent>
                    <Users2 className="size-5 text-primary" />
                    <h3 className="mt-3 font-medium text-foreground">Kurumsal Çözümler</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Şirketiniz için Çalışan Destek Programı oluşturun.
                    </p>
                  </CardContent>
                </Card>
              </SpotlightCard>
            </Link>
          </div>
        </section>
      </ScrollReveal>
    </div>
  );
}
