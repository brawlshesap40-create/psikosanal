"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  const [isGift, setIsGift] = useState(false);

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
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-4">
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
        </div>

        {isAuthenticated && isDanisan && (
          <form action={action} className="space-y-3">
            <input type="hidden" name="packageId" value={pkg.id} />

            <Input name="discountCode" placeholder="İndirim kodu (opsiyonel)" className="uppercase" />

            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <Checkbox
                checked={isGift}
                onCheckedChange={(checked) => setIsGift(Boolean(checked))}
                name="isGift"
              />
              Bunu hediye olarak satın al
            </label>

            {isGift && (
              <div className="space-y-1.5">
                <Label htmlFor={`recipientEmail-${pkg.id}`}>Alıcının e-postası</Label>
                <Input
                  id={`recipientEmail-${pkg.id}`}
                  name="recipientEmail"
                  type="email"
                  required={isGift}
                  placeholder="ornek@eposta.com"
                />
              </div>
            )}

            <Button size="sm" type="submit" disabled={pending} className="w-full">
              {pending ? "..." : isGift ? "Hediye Olarak Satın Al" : "Satın Al"}
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
