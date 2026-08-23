"use client";

import { useActionState, useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { createReviewAction, type ReviewFormState } from "@/lib/reviews/actions";

export function ReviewDialog({ appointmentId }: { appointmentId: number }) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [state, action, pending] = useActionState(async (prevState: ReviewFormState, formData: FormData) => {
    const result = await createReviewAction(prevState, formData);
    if (result?.success) setOpen(false);
    return result;
  }, undefined);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" variant="outline" />}>
        Yorum Yap
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Seansı Değerlendir</DialogTitle>
        </DialogHeader>
        <form action={action} className="space-y-3">
          <input type="hidden" name="appointmentId" value={appointmentId} />
          <input type="hidden" name="rating" value={rating} />
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setRating(value)}
                aria-label={`${value} yıldız`}
              >
                <Star
                  className={cn(
                    "size-6",
                    value <= rating
                      ? "fill-primary text-primary"
                      : "text-muted-foreground"
                  )}
                />
              </button>
            ))}
          </div>
          <Textarea name="comment" placeholder="Deneyiminizi paylaşın (opsiyonel)" rows={3} />
          {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? "Gönderiliyor..." : "Gönder"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
