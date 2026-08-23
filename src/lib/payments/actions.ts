"use server";

import { randomUUID } from "crypto";
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import {
  appointments,
  availabilitySlots,
  packagePurchases,
  payments,
  psychologistProfiles,
  users,
} from "@/lib/db/schema";
import { verifyAdminSession, verifyDanisanSession } from "@/lib/auth/dal";
import { generateVideoRoomName } from "@/lib/video/room";
import { getAvailablePackageCredit, getPackageById } from "@/lib/packages/queries";
import { checkoutFormInitializeCall, getIyzico, Iyzipay, iyzicoCall } from "./iyzico";
import { siteConfig } from "@/lib/site-config";
import { createNotification } from "@/lib/notifications/actions";

async function notifyPsychologistOfBooking(psychologistId: number) {
  const psychologist = await db.query.psychologistProfiles.findFirst({
    where: eq(psychologistProfiles.id, psychologistId),
  });
  if (!psychologist) return;
  await createNotification({
    userId: psychologist.userId,
    type: "randevu_olusturuldu",
    title: "Yeni randevunuz var",
    link: "/psikolog/randevularim",
  });
}

export type PaymentInitiateState =
  | { error?: string; checkoutFormContent?: string }
  | undefined;

async function buildBuyer(userId: number) {
  const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
  if (!user) throw new Error("Kullanıcı bulunamadı");

  const headerList = await headers();
  const forwardedFor = headerList.get("x-forwarded-for");
  const ip = forwardedFor?.split(",")[0]?.trim() || "85.34.78.112";

  const [name, ...rest] = user.fullName.trim().split(" ");
  const surname = rest.join(" ") || name;

  return {
    id: `user-${user.id}`,
    name: name || user.fullName,
    surname,
    // NOT: Gerçek T.C. kimlik numarası toplanmıyor; iyzico sandbox'ın kabul ettiği
    // örnek değer kullanılıyor. Prod'a geçmeden önce bu alan formdan toplanmalı.
    identityNumber: "74300864791",
    email: user.email,
    gsmNumber: user.phone ?? "+905555555555",
    registrationAddress: "Türkiye",
    ip,
    city: "Istanbul",
    country: "Turkey",
  };
}

function addressFrom(buyer: Awaited<ReturnType<typeof buildBuyer>>) {
  return {
    contactName: `${buyer.name} ${buyer.surname}`,
    city: buyer.city,
    country: buyer.country,
    address: buyer.registrationAddress,
  };
}

export async function initiateBookingAction(
  _prevState: PaymentInitiateState,
  formData: FormData
): Promise<PaymentInitiateState> {
  const session = await verifyDanisanSession();

  const slotId = Number(formData.get("slotId"));
  const clientNote = String(formData.get("clientNote") ?? "").trim() || null;
  if (!slotId) return { error: "Geçersiz randevu talebi." };

  const slot = await db.query.availabilitySlots.findFirst({
    where: eq(availabilitySlots.id, slotId),
  });
  if (!slot) return { error: "Bu randevu saati bulunamadı." };

  if (slot.isIntro) {
    const result = await db.transaction(async (tx) => {
      const [locked] = await tx
        .update(availabilitySlots)
        .set({ status: "dolu" })
        .where(and(eq(availabilitySlots.id, slotId), eq(availabilitySlots.status, "musait")))
        .returning();
      if (!locked) return null;

      const [appointment] = await tx
        .insert(appointments)
        .values({
          slotId,
          clientId: session.userId,
          psychologistId: locked.psychologistId,
          clientNote,
          status: "onaylandi",
          videoRoomName: generateVideoRoomName(),
          sessionType: locked.sessionType,
          isIntro: true,
        })
        .returning();

      return appointment;
    });

    if (!result) return { error: "Bu saat artık müsait değil. Lütfen başka bir saat seçin." };

    await notifyPsychologistOfBooking(slot.psychologistId);
    revalidatePath("/danisan/randevularim");
    redirect("/danisan/randevularim");
  }

  const credit = await getAvailablePackageCredit(session.userId, slot.psychologistId);

  if (credit) {
    const result = await db.transaction(async (tx) => {
      const [locked] = await tx
        .update(availabilitySlots)
        .set({ status: "dolu" })
        .where(and(eq(availabilitySlots.id, slotId), eq(availabilitySlots.status, "musait")))
        .returning();
      if (!locked) return null;

      const [appointment] = await tx
        .insert(appointments)
        .values({
          slotId,
          clientId: session.userId,
          psychologistId: locked.psychologistId,
          clientNote,
          status: "onaylandi",
          videoRoomName: generateVideoRoomName(),
          usedPackagePurchaseId: credit.id,
          sessionType: locked.sessionType,
        })
        .returning();

      await tx
        .update(packagePurchases)
        .set({ sessionsRemaining: credit.sessionsRemaining - 1 })
        .where(eq(packagePurchases.id, credit.id));

      return appointment;
    });

    if (!result) return { error: "Bu saat artık müsait değil. Lütfen başka bir saat seçin." };

    await notifyPsychologistOfBooking(slot.psychologistId);
    revalidatePath("/danisan/randevularim");
    redirect("/danisan/randevularim");
  }

  const psychologist = await db.query.psychologistProfiles.findFirst({
    where: eq(psychologistProfiles.id, slot.psychologistId),
  });
  if (!psychologist?.sessionPriceTl) {
    return { error: "Bu psikolog için seans ücreti tanımlanmamış." };
  }

  const iyzico = getIyzico();
  if (!iyzico) {
    return {
      error:
        "Ödeme sistemi şu anda yapılandırılmamış (IYZICO_API_KEY / IYZICO_SECRET_KEY eksik).",
    };
  }

  const locked = await db.transaction(async (tx) => {
    const [lockedSlot] = await tx
      .update(availabilitySlots)
      .set({ status: "dolu" })
      .where(and(eq(availabilitySlots.id, slotId), eq(availabilitySlots.status, "musait")))
      .returning();
    if (!lockedSlot) return null;

    const [appointment] = await tx
      .insert(appointments)
      .values({
        slotId,
        clientId: session.userId,
        psychologistId: lockedSlot.psychologistId,
        clientNote,
        status: "odeme_bekleniyor",
        videoRoomName: generateVideoRoomName(),
        sessionType: lockedSlot.sessionType,
      })
      .returning();

    const conversationId = randomUUID();
    const [payment] = await tx
      .insert(payments)
      .values({
        clientId: session.userId,
        psychologistId: lockedSlot.psychologistId,
        kind: "seans",
        appointmentId: appointment.id,
        amountTl: psychologist.sessionPriceTl!,
        iyzicoConversationId: conversationId,
      })
      .returning();

    return { appointment, payment };
  });

  if (!locked) return { error: "Bu saat artık müsait değil. Lütfen başka bir saat seçin." };

  const buyer = await buildBuyer(session.userId);
  const address = addressFrom(buyer);
  const price = String(locked.payment.amountTl);

  try {
    const result = await checkoutFormInitializeCall(iyzico, {
      locale: Iyzipay.LOCALE.TR,
      conversationId: locked.payment.iyzicoConversationId,
      price,
      paidPrice: price,
      currency: Iyzipay.CURRENCY.TRY,
      basketId: `seans-${locked.appointment.id}`,
      paymentGroup: Iyzipay.PAYMENT_GROUP.PRODUCT,
      callbackUrl: `${siteConfig.siteUrl}/api/payments/callback`,
      buyer,
      shippingAddress: address,
      billingAddress: address,
      basketItems: [
        {
          id: `seans-${locked.appointment.id}`,
          name: "Online Psikolog Seansı",
          category1: "Danışmanlık",
          itemType: Iyzipay.BASKET_ITEM_TYPE.VIRTUAL,
          price,
        },
      ],
    });

    if (result.status !== "success" || !result.token) {
      await releaseFailedPayment(locked.payment.id, locked.appointment.id, slotId);
      return { error: "Ödeme başlatılamadı. Lütfen tekrar deneyin." };
    }

    await db
      .update(payments)
      .set({ iyzicoToken: result.token })
      .where(eq(payments.id, locked.payment.id));

    return { checkoutFormContent: result.checkoutFormContent };
  } catch {
    await releaseFailedPayment(locked.payment.id, locked.appointment.id, slotId);
    return { error: "Ödeme sistemine ulaşılamadı. Lütfen tekrar deneyin." };
  }
}

export async function initiatePackagePurchaseAction(
  _prevState: PaymentInitiateState,
  formData: FormData
): Promise<PaymentInitiateState> {
  const session = await verifyDanisanSession();
  const packageId = Number(formData.get("packageId"));

  const pkg = await getPackageById(packageId);
  if (!pkg || !pkg.isActive) return { error: "Paket bulunamadı." };

  const iyzico = getIyzico();
  if (!iyzico) {
    return {
      error:
        "Ödeme sistemi şu anda yapılandırılmamış (IYZICO_API_KEY / IYZICO_SECRET_KEY eksik).",
    };
  }

  const conversationId = randomUUID();
  const [payment] = await db
    .insert(payments)
    .values({
      clientId: session.userId,
      psychologistId: pkg.psychologistId,
      kind: "paket",
      packageId: pkg.id,
      amountTl: pkg.priceTl,
      iyzicoConversationId: conversationId,
    })
    .returning();

  const buyer = await buildBuyer(session.userId);
  const address = addressFrom(buyer);
  const price = String(pkg.priceTl);

  try {
    const result = await checkoutFormInitializeCall(iyzico, {
      locale: Iyzipay.LOCALE.TR,
      conversationId: payment.iyzicoConversationId,
      price,
      paidPrice: price,
      currency: Iyzipay.CURRENCY.TRY,
      basketId: `paket-${pkg.id}`,
      paymentGroup: Iyzipay.PAYMENT_GROUP.PRODUCT,
      callbackUrl: `${siteConfig.siteUrl}/api/payments/callback`,
      buyer,
      shippingAddress: address,
      billingAddress: address,
      basketItems: [
        {
          id: `paket-${pkg.id}`,
          name: pkg.name,
          category1: "Danışmanlık Paketi",
          itemType: Iyzipay.BASKET_ITEM_TYPE.VIRTUAL,
          price,
        },
      ],
    });

    if (result.status !== "success" || !result.token) {
      await db.delete(payments).where(eq(payments.id, payment.id));
      return { error: "Ödeme başlatılamadı. Lütfen tekrar deneyin." };
    }

    await db.update(payments).set({ iyzicoToken: result.token }).where(eq(payments.id, payment.id));

    return { checkoutFormContent: result.checkoutFormContent };
  } catch {
    await db.delete(payments).where(eq(payments.id, payment.id));
    return { error: "Ödeme sistemine ulaşılamadı. Lütfen tekrar deneyin." };
  }
}

export type FinalizeResult = {
  ok: boolean;
  kind: "seans" | "paket" | null;
  appointmentId: number | null;
};

export async function finalizePaymentByToken(token: string): Promise<FinalizeResult> {
  const iyzico = getIyzico();
  if (!iyzico) return { ok: false, kind: null, appointmentId: null };

  const payment = await db.query.payments.findFirst({
    where: eq(payments.iyzicoToken, token),
  });
  if (!payment) return { ok: false, kind: null, appointmentId: null };

  let result;
  try {
    result = await iyzicoCall(iyzico.checkoutForm.retrieve.bind(iyzico.checkoutForm), {
      locale: Iyzipay.LOCALE.TR,
      token,
    });
  } catch {
    result = null;
  }

  const success = result?.status === "success" && result.paymentStatus === "SUCCESS";

  if (payment.kind === "seans") {
    if (!payment.appointmentId) return { ok: false, kind: "seans", appointmentId: null };

    if (success) {
      await db.transaction(async (tx) => {
        await tx
          .update(payments)
          .set({ status: "basarili", iyzicoPaymentId: result?.paymentId ?? null })
          .where(eq(payments.id, payment.id));
        await tx
          .update(appointments)
          .set({ status: "onaylandi" })
          .where(eq(appointments.id, payment.appointmentId!));
      });
      await notifyPsychologistOfBooking(payment.psychologistId);
    } else {
      const appointment = await db.query.appointments.findFirst({
        where: eq(appointments.id, payment.appointmentId),
      });
      await db.transaction(async (tx) => {
        await tx
          .update(payments)
          .set({ status: "basarisiz", failReason: "Ödeme onaylanmadı" })
          .where(eq(payments.id, payment.id));
        await tx
          .update(appointments)
          .set({
            status: "iptal_edildi",
            cancelledBy: "sistem",
            cancelReason: "Ödeme başarısız",
          })
          .where(eq(appointments.id, payment.appointmentId!));
        if (appointment) {
          await tx
            .update(availabilitySlots)
            .set({ status: "musait" })
            .where(eq(availabilitySlots.id, appointment.slotId));
        }
      });
    }

    return { ok: success, kind: "seans", appointmentId: payment.appointmentId };
  }

  // kind === "paket"
  if (success && payment.packageId) {
    const pkg = await getPackageById(payment.packageId);
    if (pkg) {
      await db.transaction(async (tx) => {
        const [purchase] = await tx
          .insert(packagePurchases)
          .values({
            packageId: pkg.id,
            clientId: payment.clientId,
            psychologistId: pkg.psychologistId,
            sessionsRemaining: pkg.sessionCount,
          })
          .returning();
        await tx
          .update(payments)
          .set({
            status: "basarili",
            iyzicoPaymentId: result?.paymentId ?? null,
            packagePurchaseId: purchase.id,
          })
          .where(eq(payments.id, payment.id));
      });
    }
  } else {
    await db
      .update(payments)
      .set({ status: "basarisiz", failReason: "Ödeme onaylanmadı" })
      .where(eq(payments.id, payment.id));
  }

  return { ok: success, kind: "paket", appointmentId: null };
}

export type RefundState = { error?: string } | undefined;

export async function refundPaymentAction(paymentId: number): Promise<RefundState> {
  await verifyAdminSession();

  const payment = await db.query.payments.findFirst({ where: eq(payments.id, paymentId) });
  if (!payment) return { error: "Ödeme bulunamadı." };
  if (payment.status !== "basarili") return { error: "Sadece başarılı ödemeler iade edilebilir." };
  if (!payment.iyzicoToken) return { error: "Bu ödeme için iyzico işlem kaydı bulunamadı." };

  const iyzico = getIyzico();
  if (!iyzico) return { error: "Ödeme sistemi yapılandırılmamış." };

  const headerList = await headers();
  const ip = headerList.get("x-forwarded-for")?.split(",")[0]?.trim() || "85.34.78.112";

  try {
    const checkoutForm = await iyzicoCall(iyzico.checkoutForm.retrieve.bind(iyzico.checkoutForm), {
      locale: Iyzipay.LOCALE.TR,
      token: payment.iyzicoToken,
    });
    const paymentTransactionId = checkoutForm.paymentItems?.[0]?.paymentTransactionId;
    if (!paymentTransactionId) return { error: "İyzico işlem kaydı bulunamadı." };

    const refundResult = await iyzicoCall(iyzico.refund.create.bind(iyzico.refund), {
      locale: Iyzipay.LOCALE.TR,
      conversationId: payment.iyzicoConversationId,
      paymentTransactionId,
      price: String(payment.amountTl),
      ip,
      currency: Iyzipay.CURRENCY.TRY,
    });

    if (refundResult.status !== "success") {
      return { error: "İade işlemi başarısız oldu." };
    }
  } catch {
    return { error: "İyzico'ya ulaşılamadı." };
  }

  await db.update(payments).set({ status: "iade" }).where(eq(payments.id, paymentId));

  if (payment.kind === "seans" && payment.appointmentId) {
    const appointment = await db.query.appointments.findFirst({
      where: eq(appointments.id, payment.appointmentId),
    });
    if (appointment && appointment.status !== "iptal_edildi") {
      await db.transaction(async (tx) => {
        await tx
          .update(appointments)
          .set({ status: "iptal_edildi", cancelledBy: "sistem", cancelReason: "Ödeme iade edildi" })
          .where(eq(appointments.id, appointment.id));
        await tx
          .update(availabilitySlots)
          .set({ status: "musait" })
          .where(eq(availabilitySlots.id, appointment.slotId));
      });
    }
  }

  revalidatePath("/admin/randevular");
  return {};
}

async function releaseFailedPayment(paymentId: number, appointmentId: number, slotId: number) {
  await db.transaction(async (tx) => {
    await tx
      .update(payments)
      .set({ status: "basarisiz", failReason: "iyzico başlatma hatası" })
      .where(eq(payments.id, paymentId));
    await tx
      .update(appointments)
      .set({ status: "iptal_edildi", cancelledBy: "sistem", cancelReason: "Ödeme başlatılamadı" })
      .where(eq(appointments.id, appointmentId));
    await tx
      .update(availabilitySlots)
      .set({ status: "musait" })
      .where(eq(availabilitySlots.id, slotId));
  });
}
