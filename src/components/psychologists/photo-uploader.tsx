"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { Loader2, UserRound } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { updatePsychologistPhotoAction } from "@/lib/psychologists/actions";

export function PhotoUploader({
  currentUrl,
  fallback,
}: {
  currentUrl: string | null;
  fallback: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [url, setUrl] = useState(currentUrl);

  async function handleFile(fileList: FileList | null) {
    const file = fileList?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("kind", "image");
      formData.append("folder", "psychologists");
      const res = await fetch("/api/uploads", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Yükleme başarısız");
      await updatePsychologistPhotoAction(data.url as string);
      setUrl(data.url as string);
      toast.success("Fotoğraf güncellendi.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Yükleme başarısız");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="flex items-center gap-4">
      <Avatar size="lg" className="size-16">
        <AvatarImage src={url ?? undefined} alt={fallback} />
        <AvatarFallback>
          <UserRound className="size-6" />
        </AvatarFallback>
      </Avatar>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
      >
        {uploading ? <Loader2 className="size-4 animate-spin" /> : "Fotoğraf Yükle"}
      </Button>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        className="hidden"
        onChange={(e) => handleFile(e.target.files)}
      />
    </div>
  );
}
