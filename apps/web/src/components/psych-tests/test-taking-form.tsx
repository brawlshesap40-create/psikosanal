"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { scoreAnswers, type ResultBand } from "@psikosanal/core/psych-tests/scoring";

const SCALE = [
  { value: 0, label: "Hiç" },
  { value: 1, label: "Bazen" },
  { value: 2, label: "Sık sık" },
  { value: 3, label: "Neredeyse her zaman" },
];

type Question = { id: number; text: string };

export function TestTakingForm({
  questions,
  resultBands,
  relatedSpecialtySlug,
}: {
  questions: Question[];
  resultBands: ResultBand[];
  relatedSpecialtySlug: string | null;
}) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [result, setResult] = useState<{ total: number; band: ResultBand } | null>(null);

  const allAnswered = questions.every((q) => answers[q.id] !== undefined);

  if (result) {
    return (
      <Card>
        <CardContent className="flex flex-col gap-3">
          <p className="text-sm text-muted-foreground">Sonucunuz</p>
          <h2 className="text-xl font-semibold text-foreground">{result.band.label}</h2>
          <p className="text-sm text-muted-foreground">{result.band.description}</p>
          <p className="text-xs text-muted-foreground">
            Bu bir tanı aracı değildir, yalnızca ön farkındalık amaçlıdır. Endişeleriniz
            sürüyorsa bir uzmana danışmanızı öneririz.
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Button
              nativeButton={false}
              render={
                <Link
                  href={
                    relatedSpecialtySlug
                      ? `/psikologlar?uzmanlik=${relatedSpecialtySlug}`
                      : "/psikologlar"
                  }
                />
              }
            >
              Psikolog Bul
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setAnswers({});
                setResult(null);
              }}
            >
              Testi Tekrar Çöz
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {questions.map((question, index) => (
        <Card key={question.id}>
          <CardContent className="flex flex-col gap-3">
            <p className="text-sm font-medium text-foreground">
              {index + 1}. {question.text}
            </p>
            <div className="flex flex-wrap gap-2">
              {SCALE.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() =>
                    setAnswers((prev) => ({ ...prev, [question.id]: option.value }))
                  }
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                    answers[question.id] === option.value
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-muted-foreground hover:bg-muted"
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      <Button
        disabled={!allAnswered}
        onClick={() => {
          const ordered = questions.map((q) => answers[q.id]);
          setResult(scoreAnswers(ordered, resultBands));
        }}
      >
        Sonucu Gör
      </Button>
    </div>
  );
}
