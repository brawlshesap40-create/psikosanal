"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { BlogFormState } from "@/lib/blog/actions";

type DefaultValues = {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImageUrl: string | null;
  authorName: string;
};

export function BlogPostForm({
  action,
  defaultValues,
}: {
  action: (state: BlogFormState, formData: FormData) => Promise<BlogFormState>;
  defaultValues?: DefaultValues;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="slug">Slug (URL)</Label>
          <Input
            id="slug"
            name="slug"
            defaultValue={defaultValues?.slug}
            required
            placeholder="ornek-yazi-basligi"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="authorName">Yazar</Label>
          <Input id="authorName" name="authorName" defaultValue={defaultValues?.authorName} required />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="title">Başlık</Label>
        <Input id="title" name="title" defaultValue={defaultValues?.title} required />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="excerpt">Özet</Label>
        <Textarea id="excerpt" name="excerpt" rows={2} defaultValue={defaultValues?.excerpt} required />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="content">İçerik</Label>
        <Textarea id="content" name="content" rows={10} defaultValue={defaultValues?.content} required />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="coverImageUrl">Kapak Görseli URL (opsiyonel)</Label>
        <Input id="coverImageUrl" name="coverImageUrl" defaultValue={defaultValues?.coverImageUrl ?? ""} />
      </div>
      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
      <Button type="submit" disabled={pending}>
        {pending ? "Kaydediliyor..." : "Kaydet"}
      </Button>
    </form>
  );
}
