import { PackageOpen } from "lucide-react";
import { verifyDanisanSession } from "@/lib/auth/dal";
import { getPackagePurchasesForClient } from "@/lib/packages/queries";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export default async function DanisanPaketlerimPage() {
  const session = await verifyDanisanSession();
  const purchases = await getPackagePurchasesForClient(session.userId);

  return (
    <div>
      <h1 className="text-xl font-semibold text-foreground">Paketlerim</h1>

      <div className="mt-6 flex flex-col gap-3">
        {purchases.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Henüz satın alınmış bir paketiniz yok. Bir psikoloğun profilinden paket satın
            alabilirsiniz.
          </p>
        )}
        {purchases.map((purchase) => (
          <Card key={purchase.id} className="transition-shadow duration-200 hover:shadow-md">
            <CardContent className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <PackageOpen className="size-4" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{purchase.package.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {purchase.psychologist.user.fullName}
                  </p>
                </div>
              </div>
              <Badge variant={purchase.sessionsRemaining > 0 ? "default" : "secondary"}>
                {purchase.sessionsRemaining} seans kaldı
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
