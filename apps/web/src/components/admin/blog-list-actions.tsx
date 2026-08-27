"use client";

import { useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { deleteBlogPostAction, togglePublishedAction } from "@/lib/blog/actions";

export function BlogListActions({ id, published }: { id: number; published: boolean }) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex flex-wrap gap-2">
      <Button size="sm" variant="outline" nativeButton={false} render={<Link href={`/admin/blog/${id}`} />}>
        Düzenle
      </Button>
      <Button
        size="sm"
        variant="secondary"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            await togglePublishedAction(id, !published);
            toast.success(published ? "Yayından kaldırıldı." : "Yayınlandı.");
          })
        }
      >
        {published ? "Yayından Kaldır" : "Yayınla"}
      </Button>
      <Button
        size="sm"
        variant="destructive"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            await deleteBlogPostAction(id);
            toast.success("Yazı silindi.");
          })
        }
      >
        Sil
      </Button>
    </div>
  );
}
