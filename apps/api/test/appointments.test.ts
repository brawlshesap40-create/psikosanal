import { beforeEach, describe, expect, it } from "vitest";
import { signAccessToken } from "@psikosanal/core";
import { testServer } from "./helpers/build";
import { truncateAll } from "./helpers/db";
import { createAppointment, createPsychologist } from "./helpers/fixtures";

beforeEach(async () => {
  await truncateAll();
});

const DANISAN = {
  fullName: "Test Danışan",
  email: "test.danisan@example.com",
  phone: "5551234567",
  password: "gecerli-sifre-123",
};

async function registerAndLoginDanisan(app: ReturnType<typeof testServer>) {
  const response = await app.inject({
    method: "POST",
    url: "/v1/auth/register/danisan",
    payload: DANISAN,
  });
  const body = response.json();
  return { userId: body.user.id as number, accessToken: body.accessToken as string };
}

async function psikologToken(userId: number, email: string) {
  return signAccessToken({ userId, email, role: "psikolog" });
}

describe("POST /v1/appointments/:id/cancel", () => {
  it("requires auth", async () => {
    const app = testServer();
    const response = await app.inject({ method: "POST", url: "/v1/appointments/1/cancel" });
    expect(response.statusCode).toBe(401);
    await app.close();
  });

  it("rejects cancellation inside the cancellation window", async () => {
    const app = testServer();
    const { userId: clientId, accessToken } = await registerAndLoginDanisan(app);
    const { profile } = await createPsychologist();
    const soon = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now
    const { appointment } = await createAppointment({
      clientId,
      psychologistId: profile.id,
      status: "onaylandi",
      startTime: soon,
    });

    const response = await app.inject({
      method: "POST",
      url: `/v1/appointments/${appointment.id}/cancel`,
      headers: { authorization: `Bearer ${accessToken}` },
    });
    expect(response.statusCode).toBe(409);
    await app.close();
  });

  it("cancels, frees the slot, notifies the psychologist, and notifies waitlisted clients", async () => {
    const app = testServer();
    const { userId: clientId, accessToken } = await registerAndLoginDanisan(app);
    const { user: psikolog, profile } = await createPsychologist();
    const later = new Date(Date.now() + 48 * 60 * 60 * 1000);
    const { appointment, slot } = await createAppointment({
      clientId,
      psychologistId: profile.id,
      status: "onaylandi",
      startTime: later,
    });

    // A different, waitlisted danisan.
    const { db } = await import("@psikosanal/db");
    const { waitlistEntries, users, notifications, availabilitySlots } = await import(
      "@psikosanal/db/schema"
    );
    const [waitingClient] = await db
      .insert(users)
      .values({
        email: "waiting@example.com",
        passwordHash: "not-a-real-hash",
        role: "danisan",
        fullName: "Bekleyen Danışan",
      })
      .returning();
    await db.insert(waitlistEntries).values({
      clientId: waitingClient.id,
      psychologistId: profile.id,
    });

    const response = await app.inject({
      method: "POST",
      url: `/v1/appointments/${appointment.id}/cancel`,
      headers: { authorization: `Bearer ${accessToken}` },
      payload: { reason: "Planım değişti" },
    });
    expect(response.statusCode).toBe(204);

    const { eq } = await import("drizzle-orm");
    const [freedSlot] = await db.select().from(availabilitySlots).where(eq(availabilitySlots.id, slot.id));
    expect(freedSlot.status).toBe("musait");

    const psikologNotifications = await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, psikolog.id));
    expect(psikologNotifications).toHaveLength(1);
    expect(psikologNotifications[0].type).toBe("randevu_iptal");

    const waitingNotifications = await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, waitingClient.id));
    expect(waitingNotifications).toHaveLength(1);
    expect(waitingNotifications[0].type).toBe("musaitlik_bildirimi");

    const [entry] = await db
      .select()
      .from(waitlistEntries)
      .where(eq(waitlistEntries.clientId, waitingClient.id));
    expect(entry.notifiedAt).not.toBeNull();
    await app.close();
  });

  it("rejects a caller who is neither the client nor the psychologist", async () => {
    const app = testServer();
    const { userId: clientId } = await registerAndLoginDanisan(app);
    const { profile } = await createPsychologist();
    const { appointment } = await createAppointment({
      clientId,
      psychologistId: profile.id,
      status: "onaylandi",
      startTime: new Date(Date.now() + 48 * 60 * 60 * 1000),
    });

    const otherToken = await signAccessToken({
      userId: clientId + 999,
      email: "someone-else@example.com",
      role: "danisan",
    });
    const response = await app.inject({
      method: "POST",
      url: `/v1/appointments/${appointment.id}/cancel`,
      headers: { authorization: `Bearer ${otherToken}` },
    });
    expect(response.statusCode).toBe(403);
    await app.close();
  });
});

describe("POST /v1/appointments/:id/complete", () => {
  it("requires a psikolog session", async () => {
    const app = testServer();
    const response = await app.inject({ method: "POST", url: "/v1/appointments/1/complete" });
    expect(response.statusCode).toBe(401);
    await app.close();
  });

  it("marks the caller's own appointment completed", async () => {
    const app = testServer();
    const { userId: clientId } = await registerAndLoginDanisan(app);
    const { user: psikolog, profile } = await createPsychologist();
    const accessToken = await psikologToken(psikolog.id, psikolog.email);
    const { appointment } = await createAppointment({
      clientId,
      psychologistId: profile.id,
      status: "onaylandi",
    });

    const response = await app.inject({
      method: "POST",
      url: `/v1/appointments/${appointment.id}/complete`,
      headers: { authorization: `Bearer ${accessToken}` },
    });
    expect(response.statusCode).toBe(204);
    await app.close();
  });
});

describe("POST /v1/appointments/:id/no-show", () => {
  it("rejects marking a not-yet-confirmed appointment", async () => {
    const app = testServer();
    const { userId: clientId } = await registerAndLoginDanisan(app);
    const { user: psikolog, profile } = await createPsychologist();
    const accessToken = await psikologToken(psikolog.id, psikolog.email);
    const { appointment } = await createAppointment({
      clientId,
      psychologistId: profile.id,
      status: "odeme_bekleniyor",
    });

    const response = await app.inject({
      method: "POST",
      url: `/v1/appointments/${appointment.id}/no-show`,
      headers: { authorization: `Bearer ${accessToken}` },
      payload: { party: "danisan" },
    });
    expect(response.statusCode).toBe(409);
    await app.close();
  });
});
