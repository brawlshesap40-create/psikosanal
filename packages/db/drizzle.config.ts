import { defineConfig } from "drizzle-kit";

// Paths are resolved relative to the process cwd (repo root), since the
// db:* scripts in the root package.json always invoke drizzle-kit from
// there with `--config packages/db/drizzle.config.ts`.
export default defineConfig({
  schema: "./packages/db/src/schema.ts",
  out: "./packages/db/drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
