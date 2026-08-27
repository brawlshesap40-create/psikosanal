import Link from "next/link";
import {
  Sparkles,
  Users,
  ClipboardList,
  MessageCircleQuestion,
  ArrowRight,
  CalendarClock,
} from "lucide-react";
import { getOptionalSession } from "@/lib/auth/dal";
import { getAppointmentsForClient } from "@/lib/appointments/queries";
import { getApprovedPsychologists } from "@/lib/psychologists/queries";
import { AppScreen } from "@/components/app/app-screen";
import { SectionHeader } from "@/components/app/app-ui";
import { PsychologistAppCard } from "@/components/app/psychologist-app-card";
import { MoodCheckIn } from "@/components/app/mood-check-in";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

function greeting() {
  const h = new Date().getHours();
  if (h < 6) return "İyi geceler";
  if (h < 12) return "Günaydın";
  if (h < 18) return "İyi günler";
  return "İyi akşamlar";
}

const QUICK_ACTIONS = [
  { href: "/uygulama/eslesme", label: "Eşleşme Testi", icon: Sparkles },
  { href: "/uygulama/psikologlar", label: "Psikolog Bul", icon: Users },
  { href: "/testler", label: "Test Çöz", icon: ClipboardList },
  { href: "/soru-sor", label: "Soru Sor", icon: MessageCircleQuestion },
];

export default async function AppHomePage() {
  const session = await getOptionalSession();
  const { items: featured } = await getApprovedPsychologists({
    sort: "puan",
    pageSize: 8,
  });

  const isDanisan = session?.role === "danisan";
  const appointments = isDanisan
    ? await getAppointmentsForClient(session.userId)
    : [];
  const nextAppointment = appointments
    .filter((a) => a.status === "onaylandi" && a.slot.startTime > new Date())
    .sort((a, b) => a.slot.startTime.getTime() - b.slot.startTime.getTime())[0];

  const initial = session?.email?.[0]?.toUpperCase() ?? "P";

  return (
    <AppScreen
      variant="hero"
      title={session ? `${greeting()} 👋` : "Psikosanal"}
      subtitle={
        session
          ? "Bugün kendine nasıl bakmak istersin?"
          : "Uzman psikologlarla online terapi, cebinde."
      }
      action={
        <Link
          href={session ? "/uygulama/profil" : "/giris?next=/uygulama"}
          className="press grid size-10 place-items-center rounded-full bg-white/15 text-white backdrop-blur"
        >
          {session ? (
            <Avatar size="sm" className="size-10 after:border-white/30">
              <AvatarFallback className="bg-white/20 text-[15px] font-semibold text-white">
                {initial}
              </AvatarFallback>
            </Avatar>
          ) : (
            <ArrowRight className="size-5" />
          )}
        </Link>
      }
    >
      <div className="flex flex-col gap-7">
        {isDanisan && <MoodCheckIn />}

        {/* --- Sıradaki seans / durum kartı --- */}
        {isDanisan ? (
          nextAppointment ? (
            <Link
              href="/uygulama/randevularim"
              className="app-card-lg app-hero-bg press block p-5 text-white"
            >
              <p className="text-[12px] font-medium tracking-wide text-white/70 uppercase">
                Sıradaki seansın
              </p>
              <p className="mt-2 text-lg font-semibold">
                {nextAppointment.psychologist.user?.fullName ??
                  nextAppointment.psychologist.title}
              </p>
              <div className="mt-1 flex items-center gap-1.5 text-sm text-white/85">
                <CalendarClock className="size-4" />
                {nextAppointment.slot.startTime.toLocaleString("tr-TR", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
              <span className="mt-4 inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1.5 text-[13px] font-semibold">
                Detaya git <ArrowRight className="size-4" />
              </span>
            </Link>
          ) : (
            <Link
              href="/uygulama/eslesme"
              className="app-card-lg app-hero-bg press block p-5 text-white"
            >
              <p className="text-[12px] font-medium tracking-wide text-white/70 uppercase">
                Sana özel
              </p>
              <p className="mt-2 text-lg font-semibold">Doğru terapisti bul</p>
              <p className="mt-1 text-sm text-white/85">
                5 kısa soru, yanıtlarına göre eşleştirelim.
              </p>
              <span className="mt-4 inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1.5 text-[13px] font-semibold">
                Teste Başla <ArrowRight className="size-4" />
              </span>
            </Link>
          )
        ) : session ? (
          <div className="app-card-lg p-5">
            <p className="text-[15px] font-semibold text-foreground">
              {session.role === "psikolog" ? "Psikolog paneli" : "Yönetim paneli"}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Randevu ve mesaj yönetimi web panelinde.
            </p>
            <Link
              href={session.role === "psikolog" ? "/psikolog/panel" : "/admin"}
              className="press mt-4 inline-flex items-center gap-1.5 rounded-full bg-brand px-4 py-2.5 text-[13px] font-semibold text-brand-foreground"
            >
              Panele Git <ArrowRight className="size-4" />
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <Link
              href="/uygulama/eslesme"
              className="app-card-lg app-hero-bg press block p-5 text-white"
            >
              <p className="text-[12px] font-medium tracking-wide text-white/70 uppercase">
                Kayıt gerekmez
              </p>
              <p className="mt-2 text-lg font-semibold">Doğru terapisti 1 dakikada bul</p>
              <p className="mt-1 text-sm text-white/85">
                Birkaç soruyu yanıtla, sana uygun psikologları gör.
              </p>
              <span className="mt-4 inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1.5 text-[13px] font-semibold">
                Teste Başla <ArrowRight className="size-4" />
              </span>
            </Link>
            <Link
              href="/giris?next=/uygulama"
              className="press block py-1 text-center text-[12px] font-semibold text-brand"
            >
              Zaten üye misin? Giriş yap
            </Link>
          </div>
        )}

        {/* --- Hızlı işlemler --- */}
        <section>
          <div className="app-hscroll">
            {QUICK_ACTIONS.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="app-card press flex w-[104px] flex-col items-center gap-2 p-3 text-center"
              >
                <span className="app-icon-tile">
                  <Icon className="size-5" />
                </span>
                <span className="text-[12px] font-medium text-foreground">{label}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* --- Öne çıkan psikologlar --- */}
        {featured.length > 0 && (
          <section>
            <SectionHeader title="Öne çıkan psikologlar" href="/uygulama/psikologlar" />
            <div className="app-hscroll">
              {featured.map((p) => (
                <PsychologistAppCard key={p.id} psychologist={p} variant="compact" />
              ))}
            </div>
          </section>
        )}

        {/* --- Kendine iyi bak --- */}
        <section>
          <SectionHeader title="Kendine iyi bak" />
          <div className="grid grid-cols-2 gap-3">
            <Link href="/testler" className="app-card press flex flex-col gap-2 p-4">
              <span className="app-icon-tile">
                <ClipboardList className="size-5" />
              </span>
              <span className="text-[13px] font-semibold text-foreground">
                Öz-değerlendirme
              </span>
              <span className="text-[11px] text-muted-foreground">
                Kısa testlerle kendini tanı
              </span>
            </Link>
            <Link href="/blog" className="app-card press flex flex-col gap-2 p-4">
              <span className="app-icon-tile">
                <Sparkles className="size-5" />
              </span>
              <span className="text-[13px] font-semibold text-foreground">Blog</span>
              <span className="text-[11px] text-muted-foreground">
                Ruh sağlığı üzerine yazılar
              </span>
            </Link>
          </div>
        </section>
      </div>
    </AppScreen>
  );
}
