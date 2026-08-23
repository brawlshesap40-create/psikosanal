"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { togglePackageActiveAction } from "@/lib/packages/actions";

type Package = {
  id: number;
  name: string;
  sessionCount: number;
  priceTl: number;
  isActive: boolean;
};

export function PackageList({ packages }: { packages: Package[] }) {
  const [pending, startTransition] = useTransition();

  if (packages.length === 0) {
    return <p className="text-sm text-muted-foreground">Henüz paket eklemediniz.</p>;
  }

  function handleToggle(id: number, next: boolean) {
    startTransition(async () => {
      await togglePackageActiveAction(id, next);
      toast.success(next ? "Paket aktifleştirildi." : "Paket pasifleştirildi.");
    });
  }

  return (
    <div className="flex flex-col gap-2">
      {packages.map((pkg) => (
        <div
          key={pkg.id}
          className="flex items-center justify-between rounded-lg border border-border px-4 py-2.5"
        >
          <div>
            <p className="text-sm font-medium text-foreground">{pkg.name}</p>
            <p className="text-xs text-muted-foreground">
              {pkg.sessionCount} seans · {pkg.priceTl.toLocaleString("tr-TR")} ₺
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={pkg.isActive ? "secondary" : "outline"}>
              {pkg.isActive ? "Aktif" : "Pasif"}
            </Badge>
            <Button
              size="sm"
              variant="ghost"
              disabled={pending}
              onClick={() => handleToggle(pkg.id, !pkg.isActive)}
            >
              {pkg.isActive ? "Pasifleştir" : "Aktifleştir"}
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
