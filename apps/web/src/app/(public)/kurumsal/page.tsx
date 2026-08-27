import { Users, ShieldCheck, LineChart, HeartHandshake } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { CorporateLeadForm } from "@/components/corporate/corporate-lead-form";
import { ScrollReveal } from "@/components/site/scroll-reveal";
import { SpotlightCard } from "@/components/site/spotlight-card";

const FEATURES = [
  {
    icon: Users,
    title: "Bireysel ve Grup Danışmanlığı",
    description:
      "Çalışanlarınız, dilerse anonim şekilde, bireysel seans veya grup atölyeleri üzerinden destek alabilir.",
  },
  {
    icon: LineChart,
    title: "Yönetici Desteği",
    description:
      "Ekip yöneticileri için stres yönetimi ve liderlik odaklı danışmanlık seansları.",
  },
  {
    icon: ShieldCheck,
    title: "Anonim ve Gizli",
    description:
      "Kimlik bilgileri şirketle paylaşılmaz; yalnızca toplu ve anonimleştirilmiş kullanım özetleri raporlanır.",
  },
  {
    icon: HeartHandshake,
    title: "Esnek Paket Yapısı",
    description: "Çalışan sayınıza ve bütçenize göre özelleştirilmiş seans paketleri.",
  },
];

export default function KurumsalPage() {
  return (
    <div>
      <div className="bg-grain relative overflow-hidden">
        <div className="mesh-gradient opacity-50" />
        <div className="mx-auto max-w-5xl px-4 pt-16 pb-4 text-center sm:px-6">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            <span className="text-gradient-brand">Çalışan Destek</span> Programı
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-base text-muted-foreground">
            Ekibinizin ruh sağlığına yatırım yapın. Şirketinize özel bir psikolojik destek
            programıyla çalışanlarınıza kolay erişilebilir, gizli ve profesyonel destek sunun.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 pb-16 sm:px-6">
        <ScrollReveal>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {FEATURES.map((feature) => (
              <SpotlightCard key={feature.title}>
                <Card>
                  <CardContent className="flex gap-3">
                    <feature.icon className="mt-0.5 size-5 shrink-0 text-primary" />
                    <div>
                      <h3 className="font-medium text-foreground">{feature.title}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                  </CardContent>
                </Card>
              </SpotlightCard>
            ))}
          </div>
        </ScrollReveal>

        <div className="mx-auto mt-16 max-w-lg">
          <h2 className="text-center text-xl font-semibold text-foreground">Teklif Alın</h2>
          <p className="mt-1 text-center text-sm text-muted-foreground">
            Bilgilerinizi bırakın, ekibimiz size uygun bir program önerisiyle dönüş yapsın.
          </p>
          <Card className="mt-6 shadow-lg shadow-black/[0.04]">
            <CardContent>
              <CorporateLeadForm />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
