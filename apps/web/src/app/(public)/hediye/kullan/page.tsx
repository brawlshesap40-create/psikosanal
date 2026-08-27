import { verifyDanisanSession } from "@/lib/auth/dal";
import { Card, CardContent } from "@/components/ui/card";
import { RedeemVoucherForm } from "@/components/gifts/redeem-voucher-form";

export default async function HediyeKullanPage() {
  await verifyDanisanSession();

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <h1 className="text-2xl font-semibold text-foreground">Hediye Kodunu Kullan</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Size hediye edilen paket kodunu aşağıya girin, seanslar hesabınıza tanımlansın.
      </p>

      <Card className="mt-6">
        <CardContent>
          <RedeemVoucherForm />
        </CardContent>
      </Card>
    </div>
  );
}
