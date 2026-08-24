import { beforeEach, describe, expect, it } from "vitest";
import { signAccessToken } from "@psikosanal/core";
import { testServer } from "./helpers/build";
import { truncateAll } from "./helpers/db";
import { createPsychologist } from "./helpers/fixtures";

beforeEach(async () => {
  await truncateAll();
});

async function psikologToken(userId: number, email: string) {
  return signAccessToken({ userId, email, role: "psikolog" });
}

function inThreeDays() {
  const date = new Date();
  date.setDate(date.getDate() + 3);
  date.setHours(14, 0, 0, 0);
  return date.toISOString();
}

describe("POST /v1/availability/slots", () => {
  it("requires a psikolog session", async () => {
    const app = testServer();
    const response = await app.inject({
      method: "POST",
      url: "/v1/availability/slots",
      payload: { startTime: inThreeDays(), durationMinutes: 50, sessionType: "bireysel", isIntro: false, repeatWeeks: 1 },
    });
    expect(response.statusCode).toBe(401);
    await app.close();
  });

  it("creates a slot for the caller's own profile", async () => {
    const app = testServer();
    const { user } = await createPsychologist();
    const accessToken = await psikologToken(user.id, user.email);

    const response = await app.inject({
      method: "POST",
      url: "/v1/availability/slots",
      headers: { authorization: `Bearer ${accessToken}` },
      payload: {
        startTime: inThreeDays(),
        durationMinutes: 50,
        sessionType: "bireysel",
        isIntro: false,
        repeatWeeks: 1,
      },
    });
    expect(response.statusCode).toBe(201);
    expect(response.json().slots).toHaveLength(1);
    await app.close();
  });
});

describe("GET /v1/psychologists/:id/slots", () => {
  it("returns only bookable (future, musait) slots, no auth required", async () => {
    const app = testServer();
    const { user, profile } = await createPsychologist();
    const accessToken = await psikologToken(user.id, user.email);

    await app.inject({
      method: "POST",
      url: "/v1/availability/slots",
      headers: { authorization: `Bearer ${accessToken}` },
      payload: {
        startTime: inThreeDays(),
        durationMinutes: 50,
        sessionType: "bireysel",
        isIntro: false,
        repeatWeeks: 1,
      },
    });

    const response = await app.inject({
      method: "GET",
      url: `/v1/psychologists/${profile.id}/slots`,
    });
    expect(response.statusCode).toBe(200);
    expect(response.json().slots).toHaveLength(1);
    await app.close();
  });
});

describe("DELETE /v1/availability/slots/:id", () => {
  it("deletes the caller's own slot", async () => {
    const app = testServer();
    const { user } = await createPsychologist();
    const accessToken = await psikologToken(user.id, user.email);

    const created = await app.inject({
      method: "POST",
      url: "/v1/availability/slots",
      headers: { authorization: `Bearer ${accessToken}` },
      payload: {
        startTime: inThreeDays(),
        durationMinutes: 50,
        sessionType: "bireysel",
        isIntro: false,
        repeatWeeks: 1,
      },
    });
    const slotId = created.json().slots[0].id;

    const response = await app.inject({
      method: "DELETE",
      url: `/v1/availability/slots/${slotId}`,
      headers: { authorization: `Bearer ${accessToken}` },
    });
    expect(response.statusCode).toBe(204);

    const remaining = await app.inject({
      method: "GET",
      url: "/v1/availability/slots",
      headers: { authorization: `Bearer ${accessToken}` },
    });
    expect(remaining.json().slots).toHaveLength(0);
    await app.close();
  });
});
