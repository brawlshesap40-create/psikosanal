import Link from "next/link";
import { Sparkles } from "lucide-react";
import { listTests } from "@/lib/psych-tests/queries";
import { Card, CardContent } from "@/components/ui/card";
import { SpotlightCard } from "@/components/site/spotlight-card";

export default async function TestlerPage() {
  const tests = await listTests();

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <h1 className="text-2xl font-semibold text-foreground">
        <span className="text-gradient-brand">Öz-Değerlendirme</span> Testleri
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Kısa testlerle kendinizi tanıyın. Bu testler bir tanı aracı değildir, yalnızca ön
        farkındalık amaçlıdır.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {tests.map((test) => (
          <Link key={test.id} href={`/testler/${test.slug}`}>
            <SpotlightCard className="h-full">
              <Card className="h-full card-interactive">
                <CardContent className="flex flex-col gap-1.5">
                  <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Sparkles className="size-4" />
                  </div>
                  <h2 className="mt-1 font-medium text-foreground">{test.title}</h2>
                  <p className="text-sm text-muted-foreground">{test.description}</p>
                </CardContent>
              </Card>
            </SpotlightCard>
          </Link>
        ))}
      </div>
    </div>
  );
}
