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

describe("POST /v1/reviews", () => {
  it("requires a danisan session", async () => {
    const app = testServer();
    const response = await app.inject({
      method: "POST",
      url: "/v1/reviews",
      payload: { appointmentId: 1, rating: 5 },
    });
    expect(response.statusCode).toBe(401);
    await app.close();
  });

  it("rejects a review for a not-yet-completed appointment", async () => {
    const app = testServer();
    const { userId: clientId, accessToken } = await registerAndLoginDanisan(app);
    const { profile } = await createPsychologist();
    const { appointment } = await createAppointment({
      clientId,
      psychologistId: profile.id,
      status: "onaylandi",
    });

    const response = await app.inject({
      method: "POST",
      url: "/v1/reviews",
      headers: { authorization: `Bearer ${accessToken}` },
      payload: { appointmentId: appointment.id, rating: 5 },
    });
    expect(response.statusCode).toBe(409);
    await app.close();
  });

  it("creates a review for a completed own appointment and notifies the psychologist", async () => {
    const app = testServer();
    const { userId: clientId, accessToken } = await registerAndLoginDanisan(app);
    const { user: psikolog, profile } = await createPsychologist();
    const { appointment } = await createAppointment({
      clientId,
      psychologistId: profile.id,
      status: "tamamlandi",
    });

    const response = await app.inject({
      method: "POST",
      url: "/v1/reviews",
      headers: { authorization: `Bearer ${accessToken}` },
      payload: { appointmentId: appointment.id, rating: 5, comment: "Harikaydı" },
    });
    expect(response.statusCode).toBe(201);

    // A pending review isn't in the public "approved" list yet.
    const publicList = await app.inject({
      method: "GET",
      url: `/v1/psychologists/${profile.id}/reviews`,
    });
    expect(publicList.json().reviews).toHaveLength(0);

    const { db } = await import("@psikosanal/db");
    const { notifications } = await import("@psikosanal/db/schema");
    const { eq } = await import("drizzle-orm");
    const rows = await db.select().from(notifications).where(eq(notifications.userId, psikolog.id));
    expect(rows).toHaveLength(1);
    await app.close();
  });

  it("rejects a duplicate review for the same appointment", async () => {
    const app = testServer();
    const { userId: clientId, accessToken } = await registerAndLoginDanisan(app);
    const { profile } = await createPsychologist();
    const { appointment } = await createAppointment({
      clientId,
      psychologistId: profile.id,
      status: "tamamlandi",
    });

    await app.inject({
      method: "POST",
      url: "/v1/reviews",
      headers: { authorization: `Bearer ${accessToken}` },
      payload: { appointmentId: appointment.id, rating: 5 },
    });
    const response = await app.inject({
      method: "POST",
      url: "/v1/reviews",
      headers: { authorization: `Bearer ${accessToken}` },
      payload: { appointmentId: appointment.id, rating: 4 },
    });
    expect(response.statusCode).toBe(409);
    await app.close();
  });
});

describe("POST /v1/reviews/:id/approve", () => {
  it("requires an admin session", async () => {
    const app = testServer();
    const response = await app.inject({ method: "POST", url: "/v1/reviews/1/approve" });
    expect(response.statusCode).toBe(401);
    await app.close();
  });

  it("makes the review visible in the public list", async () => {
    const app = testServer();
    const { userId: clientId, accessToken } = await registerAndLoginDanisan(app);
    const { profile } = await createPsychologist();
    const { appointment } = await createAppointment({
      clientId,
      psychologistId: profile.id,
      status: "tamamlandi",
    });
    const created = await app.inject({
      method: "POST",
      url: "/v1/reviews",
      headers: { authorization: `Bearer ${accessToken}` },
      payload: { appointmentId: appointment.id, rating: 5 },
    });
    expect(created.statusCode).toBe(201);

    const { db } = await import("@psikosanal/db");
    const { reviews } = await import("@psikosanal/db/schema");
    const [review] = await db.select().from(reviews);

    const adminToken = await signAccessToken({ userId: 999999, email: "admin@example.com", role: "admin" });
    const approve = await app.inject({
      method: "POST",
      url: `/v1/reviews/${review.id}/approve`,
      headers: { authorization: `Bearer ${adminToken}` },
    });
    expect(approve.statusCode).toBe(204);

    const publicList = await app.inject({
      method: "GET",
      url: `/v1/psychologists/${profile.id}/reviews`,
    });
    expect(publicList.json().reviews).toHaveLength(1);
    await app.close();
  });
});
