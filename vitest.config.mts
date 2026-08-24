import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

/**
 * One config, two environments:
 *
 *  - `tests/unit` and `tests/integration` run in Node (real fetch, no DOM).
 *  - `tests/component` runs in jsdom with Testing Library.
 *
 * `environmentMatchGlobs` picks the environment per file, so a single
 * `vitest run` covers everything without a workspace file.
 */
export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  resolve: {
    alias: {
      // `server-only` throws outside a Next server bundle; under test the
      // modules that import it are exercised directly, so it is stubbed.
      "server-only": new URL("./tests/setup/server-only-stub.ts", import.meta.url).pathname,
    },
  },
  test: {
    globals: true,
    restoreMocks: true,
    environment: "node",
    environmentMatchGlobs: [["tests/component/**", "jsdom"]],
    setupFiles: ["./tests/setup/component.tsx"],
    include: ["tests/unit/**/*.test.ts", "tests/component/**/*.test.tsx", "tests/integration/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "text-summary", "html", "lcov", "json-summary"],
      reportsDirectory: "coverage",
      include: ["src/lib/**", "src/components/**", "src/app/api/**"],
      exclude: ["**/*.d.ts", "src/components/admin/**"],
    },
  },
});
