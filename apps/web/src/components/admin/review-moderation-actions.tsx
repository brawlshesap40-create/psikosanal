"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { approveReviewAction, rejectReviewAction } from "@/lib/reviews/actions";

export function ReviewModerationActions({ reviewId }: { reviewId: number }) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex gap-2">
      <Button
        size="sm"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            await approveReviewAction(reviewId);
            toast.success("Değerlendirme yayınlandı.");
          })
        }
      >
        Onayla
      </Button>
      <Button
        size="sm"
        variant="destructive"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            await rejectReviewAction(reviewId);
            toast.success("Değerlendirme silindi.");
          })
        }
      >
        Reddet
      </Button>
    </div>
  );
}
