import Link from "next/link";
import { Compass } from "lucide-react";

export default function AppNotFound() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-4 px-8 text-center">
      <span className="app-icon-tile size-14">
        <Compass className="size-6" />
      </span>
      <div>
        <p className="text-[17px] font-semibold text-foreground">Sayfa bulunamadı</p>
        <p className="mt-1 text-[13px] text-muted-foreground">
          Aradığın şey taşınmış ya da hiç var olmamış olabilir.
        </p>
      </div>
      <Link
        href="/uygulama"
        className="press rounded-full bg-brand px-5 py-3 text-[13px] font-semibold text-brand-foreground"
      >
        Ana sayfaya dön
      </Link>
    </div>
  );
}
