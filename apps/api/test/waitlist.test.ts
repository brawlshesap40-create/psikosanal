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

describe("POST /v1/psychologists/:id/waitlist", () => {
  it("is idempotent", async () => {
    const app = testServer();
    const accessToken = await registerAndLogin(app);
    const { profile } = await createPsychologist();

    await app.inject({
      method: "POST",
      url: `/v1/psychologists/${profile.id}/waitlist`,
      headers: { authorization: `Bearer ${accessToken}` },
    });
    const second = await app.inject({
      method: "POST",
      url: `/v1/psychologists/${profile.id}/waitlist`,
      headers: { authorization: `Bearer ${accessToken}` },
    });
    expect(second.statusCode).toBe(200);
    expect(second.json()).toEqual({ joined: true });

    const status = await app.inject({
      method: "GET",
      url: `/v1/psychologists/${profile.id}/waitlist`,
      headers: { authorization: `Bearer ${accessToken}` },
    });
    expect(status.json()).toEqual({ onWaitlist: true });
    await app.close();
  });
});
