import { beforeEach, describe, expect, it } from "vitest";
import { testServer } from "./helpers/build";
import { truncateAll } from "./helpers/db";
import { createPsychologist } from "./helpers/fixtures";

beforeEach(async () => {
  await truncateAll();
});

const DANISAN = {
  fullName: "Test Danışan",
  email: "test.danisan@example.com",
  phone: "5551234567",
  password: "gecerli-sifre-123",
};

async function registerAndLogin(app: ReturnType<typeof testServer>) {
  const response = await app.inject({
    method: "POST",
    url: "/v1/auth/register/danisan",
    payload: DANISAN,
  });
  return response.json().accessToken as string;
}

describe("POST /v1/psychologists/:id/favorite", () => {
  it("requires a danisan session", async () => {
    const app = testServer();
    const { profile } = await createPsychologist();
    const response = await app.inject({
      method: "POST",
      url: `/v1/psychologists/${profile.id}/favorite`,
    });
    expect(response.statusCode).toBe(401);
    await app.close();
  });

  it("toggles favorite status on and off", async () => {
    const app = testServer();
    const accessToken = await registerAndLogin(app);
    const { profile } = await createPsychologist();

    const first = await app.inject({
      method: "POST",
      url: `/v1/psychologists/${profile.id}/favorite`,
      headers: { authorization: `Bearer ${accessToken}` },
    });
    expect(first.statusCode).toBe(200);
    expect(first.json()).toEqual({ isFavorite: true });

    const second = await app.inject({
      method: "POST",
      url: `/v1/psychologists/${profile.id}/favorite`,
      headers: { authorization: `Bearer ${accessToken}` },
    });
    expect(second.json()).toEqual({ isFavorite: false });
    await app.close();
  });
});

describe("GET /v1/favorites", () => {
  it("returns the caller's favorited psychologists", async () => {
    const app = testServer();
    const accessToken = await registerAndLogin(app);
    const { profile } = await createPsychologist();

    await app.inject({
      method: "POST",
      url: `/v1/psychologists/${profile.id}/favorite`,
      headers: { authorization: `Bearer ${accessToken}` },
    });

    const response = await app.inject({
      method: "GET",
      url: "/v1/favorites",
      headers: { authorization: `Bearer ${accessToken}` },
    });
    expect(response.statusCode).toBe(200);
    expect(response.json().favorites).toHaveLength(1);
    await app.close();
  });
});
