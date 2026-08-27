"use client";

import { useActionState, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitQuestionAction } from "@/lib/questions/actions";

export function SubmitQuestionForm() {
  const [state, action, pending] = useActionState(submitQuestionAction, undefined);
  const [isAnonymous, setIsAnonymous] = useState(false);

  if (state?.success) {
    return (
      <div className="flex flex-col items-center gap-2 py-4 text-center">
        <CheckCircle2 className="size-10 text-primary" />
        <p className="text-sm text-foreground">
          Sorunuz alındı. Uzmanlarımızdan biri cevapladığında, onayınızla burada yayınlanabilir.
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor="questionText">Sorunuz</Label>
        <Textarea id="questionText" name="questionText" rows={4} required minLength={10} />
      </div>

      <label className="flex items-center gap-2 text-sm text-muted-foreground">
        <Checkbox
          checked={isAnonymous}
          onCheckedChange={(checked) => setIsAnonymous(Boolean(checked))}
          name="isAnonymous"
        />
        Anonim olarak gönder
      </label>

      {!isAnonymous && (
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="askerName">Adınız (opsiyonel)</Label>
            <Input id="askerName" name="askerName" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="askerEmail">E-posta (opsiyonel)</Label>
            <Input id="askerEmail" name="askerEmail" type="email" />
          </div>
        </div>
      )}

      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}

      <Button type="submit" disabled={pending}>
        {pending ? "Gönderiliyor..." : "Soruyu Gönder"}
      </Button>
    </form>
  );
}
