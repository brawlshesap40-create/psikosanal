import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  target: "node20",
  clean: true,
  // Workspace packages ship as raw TypeScript source with no build step
  // (see packages/*/package.json "exports"). Without this, tsup treats
  // them as external and emits a runtime `import "@psikosanal/db"` that
  // Node can't resolve — bundle them in instead.
  noExternal: [/^@psikosanal\//],
});
