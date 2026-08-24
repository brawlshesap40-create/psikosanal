import { randomUUID } from "crypto";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@psikosanal/db";
import {
  appointments,
  availabilitySlots,
  packagePurchases,
  payments,
  psychologistProfiles,
  users,
} from "@psikosanal/db/schema";
import { generateVideoRoomName } from "../video/room";
import { getAvailablePackageCredit, getPackageById } from "../packages/service";
import { createNotification } from "../notifications/service";
import { checkoutFormInitializeCall, getIyzico, Iyzipay, iyzicoCall } from "./iyzico";
import {
  iyzicoNotConfigured,
  iyzicoUnreachable,
  noIyzicoRecord,
  onlySuccessfulRefundable,
  packageNotFound,
  paymentInitFailed,
  paymentNotFound,
  priceNotSet,
  refundFailed,
  slotNotFound,
  slotUnavailable,
} from "./errors";
import { DomainError, validationError } from "../auth/errors";

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

async function buildBuyer(userId: number, ip: string) {
  const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
  if (!user) throw validationError("Kullanıcı bulunamadı");

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

export type InitiateBookingResult =
  | { kind: "booked"; appointmentId: number }
  | { kind: "checkout"; checkoutFormContent: string };

export async function initiateBooking(
  clientId: number,
  input: { slotId: number; clientNote: string | null },
  meta: { ip: string; callbackUrl: string }
): Promise<InitiateBookingResult> {
  const { slotId, clientNote } = input;

  const slot = await db.query.availabilitySlots.findFirst({
    where: eq(availabilitySlots.id, slotId),
  });
  if (!slot) throw slotNotFound();

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
          clientId,
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

    if (!result) throw slotUnavailable();

    await notifyPsychologistOfBooking(slot.psychologistId);
    return { kind: "booked", appointmentId: result.id };
  }

  const credit = await getAvailablePackageCredit(clientId, slot.psychologistId);

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
          clientId,
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

    if (!result) throw slotUnavailable();

    await notifyPsychologistOfBooking(slot.psychologistId);
    return { kind: "booked", appointmentId: result.id };
  }

  const psychologist = await db.query.psychologistProfiles.findFirst({
    where: eq(psychologistProfiles.id, slot.psychologistId),
  });
  if (!psychologist?.sessionPriceTl) throw priceNotSet();

  const iyzico = getIyzico();
  if (!iyzico) throw iyzicoNotConfigured();

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
        clientId,
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
        clientId,
        psychologistId: lockedSlot.psychologistId,
        kind: "seans",
        appointmentId: appointment.id,
        amountTl: psychologist.sessionPriceTl!,
        iyzicoConversationId: conversationId,
      })
      .returning();

    return { appointment, payment };
  });

  if (!locked) throw slotUnavailable();

  const buyer = await buildBuyer(clientId, meta.ip);
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
      callbackUrl: meta.callbackUrl,
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
      throw paymentInitFailed();
    }

    await db.update(payments).set({ iyzicoToken: result.token }).where(eq(payments.id, locked.payment.id));

    return { kind: "checkout", checkoutFormContent: result.checkoutFormContent };
  } catch (error) {
    if (error instanceof DomainError) throw error;
    await releaseFailedPayment(locked.payment.id, locked.appointment.id, slotId);
    throw iyzicoUnreachable();
  }
}

export async function initiatePackagePurchase(
  clientId: number,
  packageId: number,
  meta: { ip: string; callbackUrl: string }
): Promise<{ checkoutFormContent: string }> {
  const pkg = await getPackageById(packageId);
  if (!pkg || !pkg.isActive) throw packageNotFound();

  const iyzico = getIyzico();
  if (!iyzico) throw iyzicoNotConfigured();

  const conversationId = randomUUID();
  const [payment] = await db
    .insert(payments)
    .values({
      clientId,
      psychologistId: pkg.psychologistId,
      kind: "paket",
      packageId: pkg.id,
      amountTl: pkg.priceTl,
      iyzicoConversationId: conversationId,
    })
    .returning();

  const buyer = await buildBuyer(clientId, meta.ip);
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
      callbackUrl: meta.callbackUrl,
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
      throw paymentInitFailed();
    }

    await db.update(payments).set({ iyzicoToken: result.token }).where(eq(payments.id, payment.id));

    return { checkoutFormContent: result.checkoutFormContent };
  } catch (error) {
    if (error instanceof DomainError) throw error;
    await db.delete(payments).where(eq(payments.id, payment.id));
    throw iyzicoUnreachable();
  }
}

export type FinalizeResult = {
  ok: boolean;
  kind: "seans" | "paket" | null;
  appointmentId: number | null;
};

export async function finalizeByToken(token: string): Promise<FinalizeResult> {
  const iyzico = getIyzico();
  if (!iyzico) return { ok: false, kind: null, appointmentId: null };

  const payment = await db.query.payments.findFirst({ where: eq(payments.iyzicoToken, token) });
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
          .set({ status: "iptal_edildi", cancelledBy: "sistem", cancelReason: "Ödeme başarısız" })
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

export async function refundPayment(paymentId: number, meta: { ip: string }) {
  const payment = await db.query.payments.findFirst({ where: eq(payments.id, paymentId) });
  if (!payment) throw paymentNotFound();
  if (payment.status !== "basarili") throw onlySuccessfulRefundable();
  if (!payment.iyzicoToken) throw noIyzicoRecord();

  const iyzico = getIyzico();
  if (!iyzico) throw iyzicoNotConfigured();

  try {
    const checkoutForm = await iyzicoCall(iyzico.checkoutForm.retrieve.bind(iyzico.checkoutForm), {
      locale: Iyzipay.LOCALE.TR,
      token: payment.iyzicoToken,
    });
    const paymentTransactionId = checkoutForm.paymentItems?.[0]?.paymentTransactionId;
    if (!paymentTransactionId) throw noIyzicoRecord();

    const refundResult = await iyzicoCall(iyzico.refund.create.bind(iyzico.refund), {
      locale: Iyzipay.LOCALE.TR,
      conversationId: payment.iyzicoConversationId,
      paymentTransactionId,
      price: String(payment.amountTl),
      ip: meta.ip,
      currency: Iyzipay.CURRENCY.TRY,
    });

    if (refundResult.status !== "success") throw refundFailed();
  } catch (error) {
    if (error instanceof DomainError) throw error;
    throw iyzicoUnreachable();
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

export async function getAllPayments() {
  return db.query.payments.findMany({
    orderBy: [desc(payments.createdAt)],
    with: {
      client: true,
      psychologist: { with: { user: true } },
    },
  });
}
