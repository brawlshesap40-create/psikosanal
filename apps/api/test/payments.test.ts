import { beforeEach, describe, expect, it, vi } from "vitest";
import { signAccessToken } from "@psikosanal/core";
import { testServer } from "./helpers/build";
import { truncateAll } from "./helpers/db";
import { createAppointment, createPsychologist } from "./helpers/fixtures";

// The iyzipay SDK talks to a real payment gateway over HTTP — no existing
// precedent in this repo for mocking an external SDK, so this establishes
// one: replace the whole "iyzipay" module with a fake whose callback-style
// methods resolve however each test configures `mockCheckoutRetrieveResult`
// / `mockRefundResult`, instead of hitting the sandbox API.
let mockCheckoutRetrieveResult: { status: string; paymentStatus?: string; paymentId?: string; paymentItems?: { paymentTransactionId: string }[] } = {
  status: "success",
  paymentStatus: "SUCCESS",
  paymentId: "mock-payment-id",
  paymentItems: [{ paymentTransactionId: "mock-transaction-id" }],
};
let mockRefundResult: { status: string } = { status: "success" };

vi.mock("iyzipay", () => {
  class MockIyzipay {
    static LOCALE = { TR: "tr" };
    static CURRENCY = { TRY: "TRY" };
    static PAYMENT_GROUP = { PRODUCT: "PRODUCT" };
    static BASKET_ITEM_TYPE = { VIRTUAL: "VIRTUAL" };

    checkoutFormInitialize = {
      create: (_data: unknown, cb: (err: unknown, result: unknown) => void) => {
        cb(null, {
          status: "success",
          token: `mock-token-${Math.random()}`,
          checkoutFormContent: "<div>mock checkout form</div>",
        });
      },
    };
    checkoutForm = {
      retrieve: (_data: unknown, cb: (err: unknown, result: unknown) => void) => {
        cb(null, mockCheckoutRetrieveResult);
      },
    };
    refund = {
      create: (_data: unknown, cb: (err: unknown, result: unknown) => void) => {
        cb(null, mockRefundResult);
      },
    };
  }
  return { default: MockIyzipay };
});

beforeEach(async () => {
  await truncateAll();
  mockCheckoutRetrieveResult = {
    status: "success",
    paymentStatus: "SUCCESS",
    paymentId: "mock-payment-id",
    paymentItems: [{ paymentTransactionId: "mock-transaction-id" }],
  };
  mockRefundResult = { status: "success" };
});

async function adminToken() {
  return signAccessToken({ userId: 999999, email: "admin@example.com", role: "admin" });
}

describe("paymentsService.initiateBooking", () => {
  it("books an intro slot directly, no payment needed", async () => {
    const { paymentsService } = await import("@psikosanal/core");
    const { profile } = await createPsychologist();
    const { db } = await import("@psikosanal/db");
    const { availabilitySlots, users } = await import("@psikosanal/db/schema");
    const [client] = await db
      .insert(users)
      .values({ email: "client@example.com", passwordHash: "x", role: "danisan", fullName: "Client" })
      .returning();
    const [slot] = await db
      .insert(availabilitySlots)
      .values({ psychologistId: profile.id, startTime: new Date(Date.now() + 86400000), isIntro: true })
      .returning();

    const result = await paymentsService.initiateBooking(
      client.id,
      { slotId: slot.id, clientNote: null },
      { ip: "127.0.0.1", callbackUrl: "http://localhost/callback" }
    );
    expect(result.kind).toBe("booked");
  });

  it("throws iyzicoNotConfigured when no package credit exists and iyzico env vars are unset", async () => {
    const { paymentsService, DomainError } = await import("@psikosanal/core");
    const { profile } = await createPsychologist();
    const { db } = await import("@psikosanal/db");
    const { availabilitySlots, users } = await import("@psikosanal/db/schema");
    const [client] = await db
      .insert(users)
      .values({ email: "client2@example.com", passwordHash: "x", role: "danisan", fullName: "Client" })
      .returning();
    const [slot] = await db
      .insert(availabilitySlots)
      .values({ psychologistId: profile.id, startTime: new Date(Date.now() + 86400000) })
      .returning();

    await expect(
      paymentsService.initiateBooking(
        client.id,
        { slotId: slot.id, clientNote: null },
        { ip: "127.0.0.1", callbackUrl: "http://localhost/callback" }
      )
    ).rejects.toBeInstanceOf(DomainError);
  });
});

describe("paid booking + iyzico callback (mocked SDK)", () => {
  it("initiates checkout, then finalizes as successful and confirms the appointment", async () => {
    const previousKey = process.env.IYZICO_API_KEY;
    const previousSecret = process.env.IYZICO_SECRET_KEY;
    process.env.IYZICO_API_KEY = "test-key";
    process.env.IYZICO_SECRET_KEY = "test-secret";

    try {
      const { paymentsService } = await import("@psikosanal/core");
      const { profile } = await createPsychologist();
      const { db } = await import("@psikosanal/db");
      const { availabilitySlots, users, payments, psychologistProfiles, appointments } =
        await import("@psikosanal/db/schema");
      const { eq } = await import("drizzle-orm");
      await db
        .update(psychologistProfiles)
        .set({ sessionPriceTl: 1000 })
        .where(eq(psychologistProfiles.id, profile.id));
      const [client] = await db
        .insert(users)
        .values({ email: "payer@example.com", passwordHash: "x", role: "danisan", fullName: "Payer" })
        .returning();
      const [slot] = await db
        .insert(availabilitySlots)
        .values({ psychologistId: profile.id, startTime: new Date(Date.now() + 86400000) })
        .returning();

      const initiated = await paymentsService.initiateBooking(
        client.id,
        { slotId: slot.id, clientNote: null },
        { ip: "127.0.0.1", callbackUrl: "http://localhost/callback" }
      );
      expect(initiated.kind).toBe("checkout");

      const [payment] = await db.select().from(payments);
      expect(payment.iyzicoToken).toBeTruthy();

      const finalized = await paymentsService.finalizeByToken(payment.iyzicoToken!);
      expect(finalized.ok).toBe(true);
      expect(finalized.kind).toBe("seans");

      const [confirmedAppointment] = await db
        .select()
        .from(appointments)
        .where(eq(appointments.id, finalized.appointmentId!));
      expect(confirmedAppointment.status).toBe("onaylandi");
    } finally {
      process.env.IYZICO_API_KEY = previousKey;
      process.env.IYZICO_SECRET_KEY = previousSecret;
    }
  });
});

describe("POST /v1/payments/:id/refund", () => {
  it("requires an admin session", async () => {
    const app = testServer();
    const response = await app.inject({ method: "POST", url: "/v1/payments/1/refund" });
    expect(response.statusCode).toBe(401);
    await app.close();
  });

  it("returns 404 for a nonexistent payment", async () => {
    const app = testServer();
    const token = await adminToken();
    const response = await app.inject({
      method: "POST",
      url: "/v1/payments/999999/refund",
      headers: { authorization: `Bearer ${token}` },
    });
    expect(response.statusCode).toBe(404);
    await app.close();
  });

  it("rejects refunding a non-successful payment", async () => {
    const app = testServer();
    const token = await adminToken();
    const { profile } = await createPsychologist();
    const { db } = await import("@psikosanal/db");
    const { payments, users } = await import("@psikosanal/db/schema");
    const [client] = await db
      .insert(users)
      .values({ email: "client3@example.com", passwordHash: "x", role: "danisan", fullName: "Client" })
      .returning();
    const [payment] = await db
      .insert(payments)
      .values({
        clientId: client.id,
        psychologistId: profile.id,
        kind: "seans",
        amountTl: 1000,
        iyzicoConversationId: "conv-1",
        status: "beklemede",
      })
      .returning();

    const response = await app.inject({
      method: "POST",
      url: `/v1/payments/${payment.id}/refund`,
      headers: { authorization: `Bearer ${token}` },
    });
    expect(response.statusCode).toBe(409);
    await app.close();
  });

  it("refunds a successful payment, cancels the appointment, and frees the slot", async () => {
    const previousKey = process.env.IYZICO_API_KEY;
    const previousSecret = process.env.IYZICO_SECRET_KEY;
    process.env.IYZICO_API_KEY = "test-key";
    process.env.IYZICO_SECRET_KEY = "test-secret";

    try {
      const app = testServer();
      const token = await adminToken();
      const { userId: clientId } = await (async () => {
        const { db } = await import("@psikosanal/db");
        const { users } = await import("@psikosanal/db/schema");
        const [client] = await db
          .insert(users)
          .values({ email: "client4@example.com", passwordHash: "x", role: "danisan", fullName: "Client" })
          .returning();
        return { userId: client.id };
      })();
      const { profile } = await createPsychologist();
      const { appointment, slot } = await createAppointment({
        clientId,
        psychologistId: profile.id,
        status: "onaylandi",
      });

      const { db } = await import("@psikosanal/db");
      const { payments, availabilitySlots } = await import("@psikosanal/db/schema");
      const [payment] = await db
        .insert(payments)
        .values({
          clientId,
          psychologistId: profile.id,
          kind: "seans",
          appointmentId: appointment.id,
          amountTl: 1000,
          iyzicoConversationId: "conv-2",
          iyzicoToken: "mock-token",
          status: "basarili",
        })
        .returning();

      const response = await app.inject({
        method: "POST",
        url: `/v1/payments/${payment.id}/refund`,
        headers: { authorization: `Bearer ${token}` },
      });
      expect(response.statusCode).toBe(204);

      const { eq } = await import("drizzle-orm");
      const { appointments } = await import("@psikosanal/db/schema");
      const [cancelled] = await db.select().from(appointments).where(eq(appointments.id, appointment.id));
      expect(cancelled.status).toBe("iptal_edildi");

      const [freedSlot] = await db.select().from(availabilitySlots).where(eq(availabilitySlots.id, slot.id));
      expect(freedSlot.status).toBe("musait");

      await app.close();
    } finally {
      process.env.IYZICO_API_KEY = previousKey;
      process.env.IYZICO_SECRET_KEY = previousSecret;
    }
  });
});
