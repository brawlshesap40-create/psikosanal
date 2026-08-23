import { describe, expect, it } from "vitest";
import { testServer } from "./helpers/build";

describe("GET /health", () => {
  it("reports ok with a reachable database", async () => {
    const app = testServer();
    const response = await app.inject({ method: "GET", url: "/health" });
    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.status).toBe("ok");
    expect(body.db).toBe("ok");
    await app.close();
  });
});
