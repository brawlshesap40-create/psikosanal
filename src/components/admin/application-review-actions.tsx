"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  approvePsychologistAction,
  rejectPsychologistAction,
} from "@/lib/psychologists/actions";

export function ApplicationReviewActions({ psychologistId }: { psychologistId: number }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [reason, setReason] = useState("");
  const [showReject, setShowReject] = useState(false);

  function handleApprove() {
    startTransition(async () => {
      await approvePsychologistAction(psychologistId);
      toast.success("Başvuru onaylandı.");
      router.push("/admin/psikolog-basvurulari");
    });
  }

  function handleReject() {
    startTransition(async () => {
      await rejectPsychologistAction(psychologistId, reason);
      toast.success("Başvuru reddedildi.");
      router.push("/admin/psikolog-basvurulari");
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2">
        <Button onClick={handleApprove} disabled={pending}>
          Onayla
        </Button>
        <Button variant="destructive" onClick={() => setShowReject((v) => !v)} disabled={pending}>
          Reddet
        </Button>
      </div>
      {showReject && (
        <div className="flex flex-col gap-2">
          <Textarea
            placeholder="Red gerekçesi"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
          />
          <Button variant="destructive" onClick={handleReject} disabled={pending}>
            Reddi Onayla
          </Button>
        </div>
      )}
    </div>
  );
}
