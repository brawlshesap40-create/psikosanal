import Link from "next/link";
import { Video, CalendarX2 } from "lucide-react";
import { getOptionalSession } from "@/lib/auth/dal";
import { getAppointmentsForClient } from "@/lib/appointments/queries";
import { AppScreen } from "@/components/app/app-screen";
import { AppGuest } from "@/components/app/app-guest";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

type SearchParams = { sekme?: string };

const STATUS: Record<string, { label: string; className: string }> = {
  odeme_bekleniyor: { label: "Ödeme bekleniyor", className: "bg-amber-400/15 text-amber-600 dark:text-amber-400" },
  onaylandi: { label: "Onaylandı", className: "bg-brand/15 text-brand" },
  tamamlandi: { label: "Tamamlandı", className: "bg-muted text-muted-foreground" },
  iptal_edildi: { label: "İptal edildi", className: "bg-destructive/15 text-destructive" },
};

export default async function AppAppointmentsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const session = await getOptionalSession();
  const { sekme } = await searchParams;
  const tab = sekme === "gecmis" ? "gecmis" : "yaklasan";

  if (!session) {
    return (
      <AppScreen title="Randevularım">
        <AppGuest next="/uygulama/randevularim" />
      </AppScreen>
    );
  }

  if (session.role !== "danisan") {
    return (
      <AppScreen title="Randevularım">
        <div className="app-card p-5 text-sm text-muted-foreground">
          Randevu takvimi web panelinde.
        </div>
      </AppScreen>
    );
  }

  const all = await getAppointmentsForClient(session.userId);
  const now = new Date();
  const upcoming = all
    .filter((a) => a.slot.startTime > now && a.status !== "iptal_edildi")
    .sort((a, b) => a.slot.startTime.getTime() - b.slot.startTime.getTime());
  const past = all
    .filter((a) => a.slot.startTime <= now || a.status === "iptal_edildi")
    .sort((a, b) => b.slot.startTime.getTime() - a.slot.startTime.getTime());
  const list = tab === "gecmis" ? past : upcoming;

  return (
    <AppScreen title="Randevularım" contentClassName="px-0">
      {/* segmented control */}
      <div className="mx-5 flex rounded-full bg-[var(--app-surface)] p-1 shadow-[var(--app-shadow)]">
        {[
          { key: "yaklasan", label: `Yaklaşan${upcoming.length ? ` (${upcoming.length})` : ""}` },
          { key: "gecmis", label: "Geçmiş" },
        ].map((t) => (
          <Link
            key={t.key}
            href={t.key === "gecmis" ? "/uygulama/randevularim?sekme=gecmis" : "/uygulama/randevularim"}
            className={cn(
              "press flex-1 rounded-full py-2 text-center text-[13px] font-semibold",
              tab === t.key ? "bg-brand text-brand-foreground" : "text-muted-foreground"
            )}
          >
            {t.label}
          </Link>
        ))}
      </div>

      <div className="mt-4 flex flex-col gap-3 px-5">
        {list.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <span className="app-icon-tile size-12">
              <CalendarX2 className="size-6" />
            </span>
            <p className="text-sm text-muted-foreground">
              {tab === "gecmis" ? "Geçmiş randevun yok." : "Yaklaşan randevun yok."}
            </p>
            {tab === "yaklasan" && (
              <Link
                href="/uygulama/psikologlar"
                className="press rounded-full bg-brand px-4 py-2.5 text-[13px] font-semibold text-brand-foreground"
              >
                Psikolog Bul
              </Link>
            )}
          </div>
        ) : (
          list.map((a) => {
            const name = a.psychologist.user?.fullName ?? a.psychologist.title;
            const st = STATUS[a.status] ?? { label: a.status, className: "bg-muted text-muted-foreground" };
            const soon =
              tab === "yaklasan" &&
              a.status === "onaylandi" &&
              a.slot.startTime.getTime() - now.getTime() < 60 * 60 * 1000;
            return (
              <div key={a.id} className="app-card overflow-hidden">
                <div className="flex gap-3 p-4">
                  <div className="flex w-12 shrink-0 flex-col items-center justify-center rounded-xl bg-[var(--app-bg)] py-2">
                    <span className="text-[11px] font-medium text-muted-foreground uppercase">
                      {a.slot.startTime.toLocaleDateString("tr-TR", { month: "short" })}
                    </span>
                    <span className="text-lg font-semibold text-foreground">
                      {a.slot.startTime.getDate()}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <Avatar className="size-6">
                        <AvatarImage src={a.psychologist.photoUrl ?? undefined} alt={name} />
                        <AvatarFallback className="text-[10px]">{name.slice(0, 1)}</AvatarFallback>
                      </Avatar>
                      <p className="truncate text-[14px] font-semibold text-foreground">{name}</p>
                    </div>
                    <p className="mt-1 text-[12px] text-muted-foreground">
                      {a.slot.startTime.toLocaleString("tr-TR", {
                        weekday: "long",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                      {a.isIntro && " · Ön görüşme"}
                    </p>
                    <span
                      className={cn(
                        "mt-2 inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold",
                        st.className
                      )}
                    >
                      {st.label}
                    </span>
                  </div>
                </div>
                {soon && (
                  <Link
                    href={`/gorusme/${a.id}`}
                    className="press flex items-center justify-center gap-1.5 border-t border-[var(--app-hairline)] bg-brand/5 py-3 text-[13px] font-semibold text-brand"
                  >
                    <Video className="size-4" /> Görüşmeye katıl
                  </Link>
                )}
              </div>
            );
          })
        )}
      </div>
    </AppScreen>
  );
}
