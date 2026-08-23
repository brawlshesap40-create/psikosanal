import { existsSync } from "fs";
import path from "path";
import { config as loadDotenv } from "dotenv";
import { defineConfig } from "vitest/config";

// Local dev: load apps/api/.env.test if present (gitignored, per-developer).
// CI: no such file exists — the workflow's own `env:` block already
// populated process.env, so this is a silent no-op there.
const testEnvPath = path.resolve(import.meta.dirname, ".env.test");
if (existsSync(testEnvPath)) {
  loadDotenv({ path: testEnvPath });
}

export default defineConfig({
  test: {
    environment: "node",
    include: ["test/**/*.test.ts"],
    globalSetup: ["./test/global-setup.ts"],
    pool: "forks",
    fileParallelism: false,
  },
});
