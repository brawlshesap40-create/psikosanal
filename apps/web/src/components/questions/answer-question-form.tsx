"use client";

import { useActionState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { answerQuestionAction } from "@/lib/questions/actions";

export function AnswerQuestionForm({ questionId }: { questionId: number }) {
  const [state, action, pending] = useActionState(
    answerQuestionAction.bind(null, questionId),
    undefined
  );

  if (state?.success) {
    return (
      <div className="flex items-center gap-2 text-sm text-primary">
        <CheckCircle2 className="size-4" />
        Cevabınız gönderildi.
      </div>
    );
  }

  return (
    <form action={action} className="space-y-2">
      <Textarea name="answerText" rows={3} required minLength={10} placeholder="Cevabınızı yazın..." />
      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
      <Button size="sm" type="submit" disabled={pending}>
        {pending ? "Gönderiliyor..." : "Cevapla"}
      </Button>
    </form>
  );
}
