"use client";

import { useActionState, useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, Check, Sparkles, ArrowRight, RotateCcw } from "lucide-react";
import { runMatchQuizAction } from "@/lib/matching/actions";
import { PsychologistAppCard } from "@/components/app/psychologist-app-card";
import { cn } from "@/lib/utils";

type Specialty = { id: number; name: string; slug: string };
type Answers = {
  specialtySlug?: string;
  maxBudgetTl?: number;
  genderPreference?: "kadin" | "erkek";
  wantsFreeIntro?: boolean;
  mode?: "list" | "auto";
};

const DONE_KEY = "psikosanal-match-done";

export function AppMatchQuiz({
  specialties,
  authed,
}: {
  specialties: Specialty[];
  authed: boolean;
}) {
  const router = useRouter();
  const [state, dispatch, pending] = useActionState(runMatchQuizAction, undefined);
  const [, startTransition] = useTransition();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [showAll, setShowAll] = useState(false);

  const steps = useMemo(
    () =>
      [
        {
          key: "specialtySlug" as const,
          title: "Hangi konuda destek arıyorsun?",
          hint: "Birini seç ya da geç.",
          options: [
            { label: "Emin değilim", value: undefined },
            ...specialties.map((s) => ({ label: s.name, value: s.slug })),
          ],
        },
        {
          key: "maxBudgetTl" as const,
          title: "Seans başına bütçen?",
          hint: "Sana uygun ücretli terapistleri önceliklendiririz.",
          options: [
            { label: "750 ₺ ve altı", value: 750 },
            { label: "1.000 ₺ ve altı", value: 1000 },
            { label: "1.500 ₺ ve altı", value: 1500 },
            { label: "Farketmez", value: undefined },
          ],
        },
        {
          key: "genderPreference" as const,
          title: "Terapist cinsiyeti tercihin?",
          options: [
            { label: "Kadın", value: "kadin" },
            { label: "Erkek", value: "erkek" },
            { label: "Farketmez", value: undefined },
          ],
        },
        {
          key: "wantsFreeIntro" as const,
          title: "Önce ücretsiz bir ön görüşme ister misin?",
          hint: "Kısa bir tanışma görüşmesiyle başlayabilirsin.",
          options: [
            { label: "Evet, önce tanışalım", value: true },
            { label: "Doğrudan seansa geçebilirim", value: false },
          ],
        },
        {
          key: "mode" as const,
          title: "Sonucu nasıl görelim?",
          options: [
            { label: "Bana uygun terapistleri listele", value: "list" },
            { label: "Benim için en uygununu seç", value: "auto" },
          ],
        },
      ] as const,
    [specialties]
  );

  const total = steps.length;
  const current = steps[step];
  const submitted = pending || Boolean(state);

  function choose(value: unknown) {
    const key = current.key;
    const nextAnswers = { ...answers, [key]: value } as Answers;
    setAnswers(nextAnswers);

    window.setTimeout(() => {
      if (step < total - 1) {
        setStep(step + 1);
      } else {
        const fd = new FormData();
        if (nextAnswers.specialtySlug) fd.set("specialtySlug", nextAnswers.specialtySlug);
        if (nextAnswers.maxBudgetTl) fd.set("maxBudgetTl", String(nextAnswers.maxBudgetTl));
        if (nextAnswers.genderPreference)
          fd.set("genderPreference", nextAnswers.genderPreference);
        if (nextAnswers.wantsFreeIntro) fd.set("wantsFreeIntro", "on");
        startTransition(() => dispatch(fd));
      }
    }, 160);
  }

  function back() {
    if (submitted) return;
    if (step === 0) router.push("/uygulama");
    else setStep(step - 1);
  }

  useEffect(() => {
    if (state?.results) {
      try {
        localStorage.setItem(DONE_KEY, "1");
      } catch {
        /* yok say */
      }
    }
  }, [state]);

  /* ---------- Sonuç ekranı ---------- */
  if (submitted) {
    if (pending) {
      return (
        <Shell progress={1} onBack={back} hideBack>
          <div className="flex flex-col items-center gap-4 py-24 text-center">
            <span className="app-icon-tile size-14 animate-pulse">
              <Sparkles className="size-6" />
            </span>
            <p className="text-[15px] font-medium text-foreground">
              Sana uygun terapistler bulunuyor…
            </p>
          </div>
        </Shell>
      );
    }

    const results = state?.results ?? [];
    const auto = answers.mode === "auto";
    const visible = auto && !showAll ? results.slice(0, 1) : results;

    return (
      <Shell progress={1} onBack={back} hideBack>
        <div className="flex flex-col gap-5 pb-4">
          <div>
            <h1 className="text-[22px] font-semibold tracking-tight text-foreground">
              {results.length === 0
                ? "Tam eşleşme bulunamadı"
                : auto
                  ? "Senin için seçtik"
                  : "Sana uygun terapistler"}
            </h1>
            <p className="mt-1 text-[13px] text-muted-foreground">
              {results.length === 0
                ? "Kriterleri gevşetip tekrar dene ya da tüm terapistleri incele."
                : "Yanıtlarına göre sıralandı."}
            </p>
          </div>

          {results.length === 0 ? (
            <div className="flex flex-col gap-2">
              <Link
                href="/uygulama/psikologlar"
                className="press rounded-full bg-brand px-4 py-3 text-center text-[13px] font-semibold text-brand-foreground"
              >
                Tüm terapistleri gör
              </Link>
              <button
                onClick={() => {
                  setStep(0);
                  setAnswers({});
                  window.location.reload();
                }}
                className="press inline-flex items-center justify-center gap-1.5 rounded-full px-4 py-3 text-[13px] font-semibold text-muted-foreground"
              >
                <RotateCcw className="size-4" /> Baştan dene
              </button>
            </div>
          ) : (
            <>
              {visible.map(({ candidate, reasons }, i) => (
                <div key={candidate.id} className="flex flex-col gap-2">
                  {auto && i === 0 && (
                    <span className="inline-flex w-fit items-center gap-1 rounded-full bg-brand/15 px-2.5 py-1 text-[11px] font-semibold text-brand">
                      <Sparkles className="size-3" /> En yüksek uyum
                    </span>
                  )}
                  <PsychologistAppCard psychologist={candidate} />
                  {reasons.length > 0 && (
                    <ul className="flex flex-col gap-1 px-1">
                      {reasons.map((r) => (
                        <li
                          key={r}
                          className="flex items-start gap-1.5 text-[12px] text-muted-foreground"
                        >
                          <Check className="mt-0.5 size-3.5 shrink-0 text-brand" />
                          {r}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}

              {auto && !showAll && results.length > 1 && (
                <button
                  onClick={() => setShowAll(true)}
                  className="press rounded-full border border-[var(--app-hairline)] bg-[var(--app-surface)] px-4 py-2.5 text-[13px] font-semibold text-foreground"
                >
                  Diğer {results.length - 1} öneriyi gör
                </button>
              )}

              <div className="mt-1 rounded-2xl bg-[var(--app-surface)] p-4 shadow-[var(--app-shadow)]">
                {authed ? (
                  <Link
                    href={`/uygulama/psikologlar/${visible[0].candidate.slug}`}
                    className="press flex items-center justify-center gap-1.5 rounded-full bg-brand px-4 py-3 text-[13px] font-semibold text-brand-foreground"
                  >
                    Randevu Al <ArrowRight className="size-4" />
                  </Link>
                ) : (
                  <>
                    <p className="mb-2 text-center text-[13px] text-muted-foreground">
                      Randevu almak için hesap oluştur — 1 dakika.
                    </p>
                    <Link
                      href="/kayit/danisan?next=/uygulama"
                      className="press flex items-center justify-center gap-1.5 rounded-full bg-brand px-4 py-3 text-[13px] font-semibold text-brand-foreground"
                    >
                      Kayıt Ol ve Devam Et <ArrowRight className="size-4" />
                    </Link>
                    <Link
                      href="/giris?next=/uygulama"
                      className="press mt-2 block text-center text-[12px] font-semibold text-brand"
                    >
                      Zaten üye misin? Giriş yap
                    </Link>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </Shell>
    );
  }

  /* ---------- Soru ekranı ---------- */
  return (
    <Shell progress={(step + 1) / total} onBack={back}>
      <div className="app-rise flex flex-col gap-1" key={step}>
        <p className="text-[12px] font-semibold text-brand">
          {step + 1} / {total}
        </p>
        <h1 className="text-[22px] leading-snug font-semibold tracking-tight text-balance text-foreground">
          {current.title}
        </h1>
        {"hint" in current && current.hint && (
          <p className="mt-0.5 text-[13px] text-muted-foreground">{current.hint}</p>
        )}

        <div className="mt-5 flex flex-col gap-2.5">
          {current.options.map((opt, i) => {
            const selected =
              answers[current.key] === opt.value ||
              (opt.value === undefined && answers[current.key] === undefined && false);
            return (
              <button
                key={i}
                type="button"
                onClick={() => choose(opt.value)}
                className={cn(
                  "press flex items-center justify-between rounded-2xl border px-4 py-3.5 text-left text-[14px] font-medium",
                  selected
                    ? "border-brand bg-brand/10 text-foreground"
                    : "app-hairline bg-[var(--app-surface)] text-foreground"
                )}
              >
                {opt.label}
                <span
                  className={cn(
                    "grid size-5 shrink-0 place-items-center rounded-full border",
                    selected ? "border-brand bg-brand text-brand-foreground" : "border-[var(--app-hairline)]"
                  )}
                >
                  {selected && <Check className="size-3.5" />}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </Shell>
  );
}

function Shell({
  progress,
  onBack,
  hideBack,
  children,
}: {
  progress: number;
  onBack: () => void;
  hideBack?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto min-h-dvh max-w-md">
      <header
        className="app-blur-bg sticky top-0 z-30 flex h-14 items-center gap-3 px-4"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        {!hideBack ? (
          <button
            onClick={onBack}
            aria-label="Geri"
            className="press -ml-1 grid size-9 place-items-center rounded-full text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="size-5" />
          </button>
        ) : (
          <span className="size-9" />
        )}
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--app-hairline)]">
          <div
            className="h-full rounded-full bg-brand transition-[width] duration-300"
            style={{ width: `${Math.round(progress * 100)}%` }}
          />
        </div>
      </header>
      <div className="px-5 pt-4 pb-32">{children}</div>
    </div>
  );
}
