import { beforeEach, describe, expect, it } from "vitest";
import { testServer } from "./helpers/build";
import { truncateAll } from "./helpers/db";

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
  const { user, accessToken } = response.json();
  return { userId: user.id as number, accessToken: accessToken as string };
}

describe("GET /v1/notifications", () => {
  it("requires auth", async () => {
    const app = testServer();
    const response = await app.inject({ method: "GET", url: "/v1/notifications" });
    expect(response.statusCode).toBe(401);
    await app.close();
  });

  it("returns the caller's notifications and unread count", async () => {
    const app = testServer();
    const { userId, accessToken } = await registerAndLogin(app);

    const { db } = await import("@psikosanal/db");
    const { notifications } = await import("@psikosanal/db/schema");
    await db.insert(notifications).values([
      { userId, type: "yeni_mesaj", title: "Yeni mesajınız var" },
      { userId, type: "randevu_olusturuldu", title: "Randevunuz oluşturuldu" },
    ]);

    const response = await app.inject({
      method: "GET",
      url: "/v1/notifications",
      headers: { authorization: `Bearer ${accessToken}` },
    });
    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.items).toHaveLength(2);
    expect(body.unread).toBe(2);
    await app.close();
  });
});

describe("POST /v1/notifications/:id/read", () => {
  it("marks only the caller's own notification as read", async () => {
    const app = testServer();
    const { userId, accessToken } = await registerAndLogin(app);

    const { db } = await import("@psikosanal/db");
    const { notifications } = await import("@psikosanal/db/schema");
    const [notification] = await db
      .insert(notifications)
      .values({ userId, type: "yeni_mesaj", title: "Yeni mesajınız var" })
      .returning();

    const response = await app.inject({
      method: "POST",
      url: `/v1/notifications/${notification.id}/read`,
      headers: { authorization: `Bearer ${accessToken}` },
    });
    expect(response.statusCode).toBe(204);

    const unreadCount = await app.inject({
      method: "GET",
      url: "/v1/notifications",
      headers: { authorization: `Bearer ${accessToken}` },
    });
    expect(unreadCount.json().unread).toBe(0);
    await app.close();
  });
});

describe("POST /v1/notifications/read-all", () => {
  it("marks all of the caller's notifications as read", async () => {
    const app = testServer();
    const { userId, accessToken } = await registerAndLogin(app);

    const { db } = await import("@psikosanal/db");
    const { notifications } = await import("@psikosanal/db/schema");
    await db.insert(notifications).values([
      { userId, type: "yeni_mesaj", title: "Yeni mesajınız var" },
      { userId, type: "randevu_olusturuldu", title: "Randevunuz oluşturuldu" },
    ]);

    const response = await app.inject({
      method: "POST",
      url: "/v1/notifications/read-all",
      headers: { authorization: `Bearer ${accessToken}` },
    });
    expect(response.statusCode).toBe(204);

    const after = await app.inject({
      method: "GET",
      url: "/v1/notifications",
      headers: { authorization: `Bearer ${accessToken}` },
    });
    expect(after.json().unread).toBe(0);
    await app.close();
  });
});
