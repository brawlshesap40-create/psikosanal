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

const PACKAGE = { name: "5 Seanslık Paket", sessionCount: 5, priceTl: 5000 };

describe("POST /v1/packages", () => {
  it("requires a psikolog session", async () => {
    const app = testServer();
    const response = await app.inject({ method: "POST", url: "/v1/packages", payload: PACKAGE });
    expect(response.statusCode).toBe(401);
    await app.close();
  });

  it("creates a package for the caller's own profile", async () => {
    const app = testServer();
    const { user } = await createPsychologist();
    const accessToken = await psikologToken(user.id, user.email);

    const response = await app.inject({
      method: "POST",
      url: "/v1/packages",
      headers: { authorization: `Bearer ${accessToken}` },
      payload: PACKAGE,
    });
    expect(response.statusCode).toBe(201);
    expect(response.json().name).toBe(PACKAGE.name);
    await app.close();
  });
});

describe("GET /v1/psychologists/:id/packages", () => {
  it("returns only active packages, no auth required", async () => {
    const app = testServer();
    const { user, profile } = await createPsychologist();
    const accessToken = await psikologToken(user.id, user.email);

    const created = await app.inject({
      method: "POST",
      url: "/v1/packages",
      headers: { authorization: `Bearer ${accessToken}` },
      payload: PACKAGE,
    });
    const packageId = created.json().id;

    await app.inject({
      method: "PATCH",
      url: `/v1/packages/${packageId}`,
      headers: { authorization: `Bearer ${accessToken}` },
      payload: { isActive: false },
    });

    const response = await app.inject({
      method: "GET",
      url: `/v1/psychologists/${profile.id}/packages`,
    });
    expect(response.statusCode).toBe(200);
    expect(response.json().packages).toHaveLength(0);
    await app.close();
  });
});
