import { desc, eq, sql } from "drizzle-orm";
import { db } from "@psikosanal/db";
import { discountCodes } from "@psikosanal/db/schema";
import type { createDiscountCodeSchema } from "../validation/discount";
import type { z } from "zod";
import {
  discountCodeExpired,
  discountCodeLimitReached,
  discountCodeNotApplicable,
  discountCodeNotFound,
  discountCodeTaken,
} from "./errors";

/** Leaves at least 1 TL payable so a 100%-off code never sends iyzico a zero amount. */
export function calculateDiscount(
  amountTl: number,
  code: { kind: "yuzde" | "tutar"; value: number }
) {
  const raw = code.kind === "yuzde" ? Math.round((amountTl * code.value) / 100) : code.value;
  const maxDiscount = Math.max(amountTl - 1, 0);
  const discountAmountTl = Math.min(raw, maxDiscount);
  const finalAmountTl = amountTl - discountAmountTl;
  return { discountAmountTl, finalAmountTl };
}

export async function validateAndPriceDiscount(
  code: string,
  kind: "seans" | "paket",
  amountTl: number
) {
  const record = await db.query.discountCodes.findFirst({
    where: eq(discountCodes.code, code.trim().toUpperCase()),
  });
  if (!record || !record.isActive) throw discountCodeNotFound();

  const now = new Date();
  if (record.validFrom && now < record.validFrom) throw discountCodeNotFound();
  if (record.validUntil && now > record.validUntil) throw discountCodeExpired();
  if (record.maxUses !== null && record.usedCount >= record.maxUses)
    throw discountCodeLimitReached();
  if (record.appliesTo !== "hepsi" && record.appliesTo !== kind)
    throw discountCodeNotApplicable();

  const { discountAmountTl, finalAmountTl } = calculateDiscount(amountTl, record);
  return { discountCodeId: record.id, discountAmountTl, finalAmountTl };
}

export async function incrementUsage(discountCodeId: number) {
  await db
    .update(discountCodes)
    .set({ usedCount: sql`${discountCodes.usedCount} + 1` })
    .where(eq(discountCodes.id, discountCodeId));
}

export async function createCode(input: z.infer<typeof createDiscountCodeSchema>) {
  try {
    const [created] = await db.insert(discountCodes).values(input).returning();
    return created;
  } catch {
    throw discountCodeTaken();
  }
}

export async function listCodes() {
  return db.query.discountCodes.findMany({ orderBy: [desc(discountCodes.createdAt)] });
}

export async function toggleActive(id: number, isActive: boolean) {
  await db.update(discountCodes).set({ isActive }).where(eq(discountCodes.id, id));
}
