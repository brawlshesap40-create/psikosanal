import Link from "next/link";
import { CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default async function OdemeSonucPage({
  searchParams,
}: {
  searchParams: Promise<{ durum?: string; tur?: string }>;
}) {
  const { durum, tur } = await searchParams;
  const success = durum === "basarili";

  return (
    <div className="mx-auto flex max-w-md flex-col justify-center px-4 py-16 text-center sm:px-6">
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-4">
          {success ? (
            <CheckCircle2 className="size-10 text-primary" />
          ) : (
            <XCircle className="size-10 text-destructive" />
          )}
          <h1 className="text-lg font-semibold text-foreground">
            {success ? "Ödeme Başarılı" : "Ödeme Başarısız"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {success
              ? tur === "paket"
                ? "Paketiniz hesabınıza tanımlandı."
                : "Randevunuz onaylandı."
              : "Ödemeniz tamamlanamadı. Lütfen tekrar deneyin."}
          </p>
          <Button
            variant="outline"
            nativeButton={false}
            render={
              <Link href={tur === "paket" ? "/danisan/paketlerim" : "/danisan/randevularim"} />
            }
          >
            {tur === "paket" ? "Paketlerim" : "Randevularım"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
