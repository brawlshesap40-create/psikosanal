"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { publishQuestionAction, unpublishQuestionAction } from "@/lib/questions/actions";

export function QuestionPublishToggle({
  id,
  status,
}: {
  id: number;
  status: "bekliyor" | "yanitlandi" | "yayinda";
}) {
  const [pending, startTransition] = useTransition();
  const isPublished = status === "yayinda";

  return (
    <Button
      size="sm"
      variant={isPublished ? "secondary" : "default"}
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          if (isPublished) {
            await unpublishQuestionAction(id);
            toast.success("Yayından kaldırıldı.");
          } else {
            await publishQuestionAction(id);
            toast.success("Yayınlandı.");
          }
        })
      }
    >
      {isPublished ? "Yayından Kaldır" : "Yayınla"}
    </Button>
  );
}
