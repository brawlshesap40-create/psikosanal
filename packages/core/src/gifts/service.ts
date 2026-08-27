import { randomBytes } from "crypto";
import { and, eq } from "drizzle-orm";
import { db } from "@psikosanal/db";
import { giftVouchers, packagePurchases } from "@psikosanal/db/schema";
import { voucherAlreadyRedeemed, voucherNotFound } from "./errors";

export function generateGiftCode() {
  return randomBytes(5).toString("hex").toUpperCase();
}

export async function redeemVoucher(code: string, clientId: number) {
  const voucher = await db.query.giftVouchers.findFirst({
    where: eq(giftVouchers.code, code.trim().toUpperCase()),
    with: { package: true },
  });
  if (!voucher) throw voucherNotFound();
  if (voucher.redeemed) throw voucherAlreadyRedeemed();

  await db.transaction(async (tx) => {
    // Conditioned on redeemed=false so two concurrent redemptions of the same
    // code can't both pass — only one transaction's UPDATE affects a row.
    const [claimed] = await tx
      .update(giftVouchers)
      .set({ redeemed: true, redeemedByClientId: clientId, redeemedAt: new Date() })
      .where(and(eq(giftVouchers.id, voucher.id), eq(giftVouchers.redeemed, false)))
      .returning();
    if (!claimed) throw voucherAlreadyRedeemed();

    await tx.insert(packagePurchases).values({
      packageId: voucher.packageId,
      clientId,
      psychologistId: voucher.package.psychologistId,
      sessionsRemaining: voucher.package.sessionCount,
    });
  });
}

export async function getVoucherByPaymentId(paymentId: number) {
  return db.query.giftVouchers.findFirst({ where: eq(giftVouchers.paymentId, paymentId) });
}
