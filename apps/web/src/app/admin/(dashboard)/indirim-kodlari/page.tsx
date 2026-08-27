import { listCodes } from "@/lib/discounts/queries";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { DiscountCodeForm } from "@/components/admin/discount-code-form";
import { DiscountCodeToggle } from "@/components/admin/discount-code-toggle";

const KIND_LABEL: Record<string, string> = { yuzde: "%", tutar: "₺" };

export default async function AdminIndirimKodlariPage() {
  const codes = await listCodes();

  return (
    <div>
      <h1 className="text-xl font-semibold text-foreground">İndirim Kodları</h1>

      <Card className="mt-6">
        <CardContent>
          <DiscountCodeForm />
        </CardContent>
      </Card>

      <div className="mt-6 flex flex-col gap-3">
        {codes.length === 0 && (
          <p className="text-sm text-muted-foreground">Henüz indirim kodu eklenmedi.</p>
        )}
        {codes.map((code) => (
          <Card key={code.id}>
            <CardContent className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="font-mono font-medium text-foreground">{code.code}</p>
                <p className="text-sm text-muted-foreground">
                  {code.value}
                  {KIND_LABEL[code.kind]} indirim · {code.usedCount}
                  {code.maxUses ? `/${code.maxUses}` : ""} kullanıldı
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={code.isActive ? "default" : "secondary"}>
                  {code.isActive ? "Aktif" : "Pasif"}
                </Badge>
                <DiscountCodeToggle id={code.id} isActive={code.isActive} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
