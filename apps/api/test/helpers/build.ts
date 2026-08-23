import { buildServer } from "../../src/server";

export function testServer() {
  return buildServer({ logger: false });
}
