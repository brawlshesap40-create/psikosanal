import { NextRequest, NextResponse } from "next/server";
import { finalizePaymentByToken } from "@/lib/payments/actions";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const token = String(formData.get("token") ?? "");

  if (!token) {
    return NextResponse.redirect(new URL("/odeme/sonuc?durum=hata", request.url));
  }

  const result = await finalizePaymentByToken(token);
  const durum = result.ok ? "basarili" : "basarisiz";
  const params = new URLSearchParams({ durum, tur: result.kind ?? "" });

  return NextResponse.redirect(new URL(`/odeme/sonuc?${params.toString()}`, request.url));
}

export async function GET(request: NextRequest) {
  return NextResponse.redirect(new URL("/", request.url));
}
