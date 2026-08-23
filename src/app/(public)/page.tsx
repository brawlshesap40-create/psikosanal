import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getApprovedPsychologists } from "@/lib/psychologists/queries";
import { PsychologistCard } from "@/components/psychologists/psychologist-card";

export default async function HomePage() {
  const { items: psychologists } = await getApprovedPsychologists({ sort: "puan", pageSize: 3 });
  const featured = psychologists;

  return (
    <div>
      <section className="mx-auto max-w-6xl px-4 py-16 text-center sm:px-6 sm:py-24">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-5xl">
          Size uygun psikoloğu bulun
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
          Alanında uzman psikologları keşfedin, profillerini inceleyin ve
          online randevunuzu birkaç dakikada oluşturun.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button size="lg" nativeButton={false} render={<Link href="/psikologlar" />}>
            Psikolog Bul
          </Button>
          <Button
            size="lg"
            variant="outline"
            nativeButton={false}
            render={<Link href="/kayit/psikolog" />}
          >
            Psikolog Olarak Katıl
          </Button>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 sm:pb-24">
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { title: "1. Ara", desc: "Uzmanlık alanı, şehir veya fiyata göre filtreleyin." },
            { title: "2. İncele", desc: "Psikologların profilini ve deneyimini okuyun." },
            { title: "3. Randevu Alın", desc: "Müsait saatlerden birini seçip anında onaylayın." },
          ].map((step) => (
            <Card key={step.title}>
              <CardContent className="py-2">
                <h3 className="font-medium text-foreground">{step.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{step.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {featured.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 sm:pb-24">
          <h2 className="mb-6 text-xl font-semibold text-foreground">
            Öne Çıkan Psikologlar
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((psychologist) => (
              <PsychologistCard key={psychologist.id} psychologist={psychologist} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
