"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { IyzicoEmbed } from "@/components/payments/iyzico-embed";
import { initiatePackagePurchaseAction } from "@/lib/payments/actions";

type Package = { id: number; name: string; sessionCount: number; priceTl: number };

export function PackagePurchaseCard({
  pkg,
  isAuthenticated,
  isDanisan,
  nextPath,
}: {
  pkg: Package;
  isAuthenticated: boolean;
  isDanisan: boolean;
  nextPath: string;
}) {
  const [state, action, pending] = useActionState(initiatePackagePurchaseAction, undefined);

  if (state?.checkoutFormContent) {
    return (
      <Card>
        <CardContent>
          <IyzicoEmbed checkoutFormContent={state.checkoutFormContent} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="flex items-center justify-between gap-4">
        <div>
          <p className="font-medium text-foreground">{pkg.name}</p>
          <p className="text-sm text-muted-foreground">
            {pkg.sessionCount} seans · {pkg.priceTl.toLocaleString("tr-TR")} ₺
          </p>
        </div>

        {!isAuthenticated && (
          <Button
            size="sm"
            variant="outline"
            nativeButton={false}
            render={<Link href={`/giris?next=${encodeURIComponent(nextPath)}`} />}
          >
            Giriş Yap
          </Button>
        )}
        {isAuthenticated && !isDanisan && (
          <span className="text-xs text-muted-foreground">Danışan hesabı gerekir</span>
        )}
        {isAuthenticated && isDanisan && (
          <form action={action}>
            <input type="hidden" name="packageId" value={pkg.id} />
            <Button size="sm" type="submit" disabled={pending}>
              {pending ? "..." : "Satın Al"}
            </Button>
          </form>
        )}
      </CardContent>
      {state?.error && (
        <CardContent className="pt-0">
          <p className="text-sm text-destructive">{state.error}</p>
        </CardContent>
      )}
    </Card>
  );
}
