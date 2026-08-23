import { NextRequest, NextResponse } from "next/server";
import { getOptionalSession } from "@/lib/auth/dal";
import { uploadDocument, uploadImage } from "@/lib/storage/upload";

export async function POST(request: NextRequest) {
  const session = await getOptionalSession();
  if (!session || (session.role !== "psikolog" && session.role !== "admin")) {
    return NextResponse.json({ error: "Yetkisiz erisim" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const kind = formData.get("kind");
  const folder = formData.get("folder");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Dosya bulunamadi" }, { status: 400 });
  }
  if (typeof folder !== "string" || folder.length === 0) {
    return NextResponse.json({ error: "Klasor belirtilmedi" }, { status: 400 });
  }

  try {
    const result =
      kind === "document"
        ? await uploadDocument(file, folder)
        : await uploadImage(file, folder);

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Yukleme basarisiz";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
