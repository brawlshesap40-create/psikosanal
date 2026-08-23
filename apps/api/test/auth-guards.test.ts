import { beforeEach, describe, expect, it } from "vitest";
import { testServer } from "./helpers/build";
import { truncateAll } from "./helpers/db";

beforeEach(async () => {
  await truncateAll();
});

describe("requireRole guard", () => {
  it("rejects a token whose role doesn't match the required role", async () => {
    const app = testServer();
    // A minimal role-gated route to exercise the guard — none of the
    // Phase 2 auth endpoints are role-restricted yet (that lands with the
    // domains ported in later phases), so this proves the primitive works.
    // Registered as a plugin (not a direct app.get call) so it boots after
    // authPlugin's fp()-attached decorators actually exist on the instance.
    app.register(async (instance) => {
      instance.get(
        "/v1/_test/danisan-only",
        { preHandler: [instance.authenticate, instance.requireRole("danisan")] },
        async () => ({ ok: true })
      );
    });

    const registerResponse = await app.inject({
      method: "POST",
      url: "/v1/auth/register/danisan",
      payload: {
        fullName: "Guard Test",
        email: "guard.test@example.com",
        phone: "5551112233",
        password: "gecerli-sifre-123",
      },
    });
    const { accessToken } = registerResponse.json();

    const asPsikologWouldBeRejected = await app.inject({
      method: "GET",
      url: "/v1/_test/danisan-only",
      headers: { authorization: "Bearer garbage-not-even-valid" },
    });
    expect(asPsikologWouldBeRejected.statusCode).toBe(401);

    const asDanisanAllowed = await app.inject({
      method: "GET",
      url: "/v1/_test/danisan-only",
      headers: { authorization: `Bearer ${accessToken}` },
    });
    expect(asDanisanAllowed.statusCode).toBe(200);

    await app.close();
  });
});
