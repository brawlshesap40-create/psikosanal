import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { LogoMark } from "@/components/site/logo";

/** Oturum yokken app ekranlarında gösterilen karşılama / giriş bloğu. */
export function AppGuest({ next = "/uygulama" }: { next?: string }) {
  return (
    <div className="flex flex-col items-center gap-5 py-14 text-center">
      <LogoMark className="size-14" />
      <div>
        <p className="text-[17px] font-semibold text-foreground">
          Psikosanal&apos;e hoş geldin
        </p>
        <p className="mx-auto mt-1 max-w-[16rem] text-[13px] text-muted-foreground">
          Randevularını, mesajlarını ve sana özel önerileri görmek için giriş yap.
        </p>
      </div>

      <div className="flex w-full max-w-xs flex-col gap-2">
        <Link
          href="/uygulama/eslesme"
          className="press flex items-center justify-center gap-1.5 rounded-full bg-brand px-4 py-3 text-[13px] font-semibold text-brand-foreground"
        >
          Eşleşme testini çöz <ArrowRight className="size-4" />
        </Link>
        <Link
          href={`/giris?next=${encodeURIComponent(next)}`}
          className="press rounded-full border border-[var(--app-hairline)] bg-[var(--app-surface)] px-4 py-3 text-[13px] font-semibold text-foreground"
        >
          Giriş Yap
        </Link>
        <Link
          href="/kayit/danisan"
          className="press py-1 text-[12px] font-semibold text-brand"
        >
          Hesabın yok mu? Kayıt ol
        </Link>
      </div>
    </div>
  );
}
