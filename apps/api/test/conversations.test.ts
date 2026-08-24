import { beforeEach, describe, expect, it } from "vitest";
import { signAccessToken } from "@psikosanal/core";
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

async function registerAndLoginDanisan(app: ReturnType<typeof testServer>) {
  const response = await app.inject({
    method: "POST",
    url: "/v1/auth/register/danisan",
    payload: DANISAN,
  });
  const body = response.json();
  return { userId: body.user.id as number, accessToken: body.accessToken as string };
}

describe("POST /v1/conversations/:clientId/:psychologistId/messages", () => {
  it("rejects a caller who is neither the client nor the psychologist", async () => {
    const app = testServer();
    const { userId: clientId } = await registerAndLoginDanisan(app);
    const { profile } = await createPsychologist();

    // A different, uninvolved danisan tries to post into this conversation.
    const otherDanisanToken = await signAccessToken({
      userId: clientId + 999,
      email: "someone-else@example.com",
      role: "danisan",
    });

    const response = await app.inject({
      method: "POST",
      url: `/v1/conversations/${clientId}/${profile.id}/messages`,
      headers: { authorization: `Bearer ${otherDanisanToken}` },
      payload: { body: "Merhaba" },
    });
    expect(response.statusCode).toBe(403);
    await app.close();
  });

  it("sends a message and notifies the recipient", async () => {
    const app = testServer();
    const { userId: clientId, accessToken } = await registerAndLoginDanisan(app);
    const { profile } = await createPsychologist();

    const response = await app.inject({
      method: "POST",
      url: `/v1/conversations/${clientId}/${profile.id}/messages`,
      headers: { authorization: `Bearer ${accessToken}` },
      payload: { body: "Merhaba, uygunluğunuz nedir?" },
    });
    expect(response.statusCode).toBe(204);

    const messages = await app.inject({
      method: "GET",
      url: `/v1/conversations/${clientId}/${profile.id}/messages`,
      headers: { authorization: `Bearer ${accessToken}` },
    });
    expect(messages.json().messages).toHaveLength(1);

    const { db } = await import("@psikosanal/db");
    const { notifications } = await import("@psikosanal/db/schema");
    const { eq } = await import("drizzle-orm");
    const rows = await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, profile.userId));
    expect(rows).toHaveLength(1);
    expect(rows[0].type).toBe("yeni_mesaj");
    await app.close();
  });
});
