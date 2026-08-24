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
async function adminToken() {
  return signAccessToken({ userId: 999999, email: "admin@example.com", role: "admin" });
}

describe("GET /v1/psychologists", () => {
  it("lists only approved psychologists", async () => {
    const app = testServer();
    await createPsychologist({ approvalStatus: "onaylandi" });
    await createPsychologist({ approvalStatus: "beklemede" });

    const response = await app.inject({ method: "GET", url: "/v1/psychologists" });
    expect(response.statusCode).toBe(200);
    expect(response.json().items).toHaveLength(1);
    await app.close();
  });
});

describe("GET /v1/psychologists/:slug", () => {
  it("returns 404 for a non-approved or unknown slug", async () => {
    const app = testServer();
    const response = await app.inject({ method: "GET", url: "/v1/psychologists/nobody" });
    expect(response.statusCode).toBe(404);
    await app.close();
  });

  it("returns the approved psychologist by slug", async () => {
    const app = testServer();
    const { profile } = await createPsychologist();
    const response = await app.inject({ method: "GET", url: `/v1/psychologists/${profile.slug}` });
    expect(response.statusCode).toBe(200);
    expect(response.json().slug).toBe(profile.slug);
    await app.close();
  });
});

describe("PATCH /v1/psychologists/me/profile", () => {
  it("updates the caller's own profile and specialties", async () => {
    const app = testServer();
    const { user } = await createPsychologist();
    const accessToken = await psikologToken(user.id, user.email);

    const response = await app.inject({
      method: "PATCH",
      url: "/v1/psychologists/me/profile",
      headers: { authorization: `Bearer ${accessToken}` },
      payload: {
        title: "Uzman Psikolog",
        bio: "Güncellenmiş biyografi metni buraya gelecek.",
        experienceYears: 7,
        sessionPriceTl: 1500,
        city: "Ankara",
        onlineAvailable: true,
        inPersonAvailable: false,
        specialtyIds: [],
        gender: "belirtilmemis",
        languages: ["Türkçe"],
        approaches: [],
        introCallEnabled: true,
      },
    });
    expect(response.statusCode).toBe(204);
    await app.close();
  });
});

describe("POST /v1/psychologists/:id/approve", () => {
  it("requires an admin session", async () => {
    const app = testServer();
    const { profile } = await createPsychologist({ approvalStatus: "beklemede" });
    const response = await app.inject({
      method: "POST",
      url: `/v1/psychologists/${profile.id}/approve`,
    });
    expect(response.statusCode).toBe(401);
    await app.close();
  });

  it("approves a pending application", async () => {
    const app = testServer();
    const { profile } = await createPsychologist({ approvalStatus: "beklemede" });
    const token = await adminToken();

    const response = await app.inject({
      method: "POST",
      url: `/v1/psychologists/${profile.id}/approve`,
      headers: { authorization: `Bearer ${token}` },
    });
    expect(response.statusCode).toBe(204);

    const publicList = await app.inject({ method: "GET", url: "/v1/psychologists" });
    expect(publicList.json().items).toHaveLength(1);
    await app.close();
  });
});
